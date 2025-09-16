<?php
/*
Plugin Name: Career Baist Main Plugin
Plugin URI: https://
Description: Resume optimizer website main logic
Version: 1.0
Author: Dif & Lucy
Author URI: https://
*/

if (!defined('ABSPATH')) {
    exit; // 防止直接访问
}

class ResumeOptimizer {

    public function __construct() {
        register_activation_hook(__FILE__, array($this, 'on_activation'));
        // add_action('init', array($this, 'register_resume_post_type'));
        add_action( 'init', array($this, 'my_custom_cors_headers') );
        
        // 对于 OPTIONS 预检请求的处理
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action( 'rest_api_init', array($this, 'my_custom_cors_options_response'), 15 ); // 确保在路由注册后运行
    }
    public function my_custom_cors_headers() {
        // 确保在请求到达REST API之前设置这些头
        // 仅在需要时允许特定来源，而不是所有来源
        // header( 'Access-Control-Allow-Origin: http://localhost' ); // 替换为你的前端域名/端口
        // 或者对于多个允许的来源：
        $origin = get_http_origin();
        if ( $origin && in_array( $origin, array( 'http://localhost', 'https://localhost', 'https://nonpareil.me', 'https://career.nonpareil.me' ) ) ) {
           header( 'Access-Control-Allow-Origin: ' . $origin );
        }
    
        header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With' );
        header( 'Access-Control-Allow-Credentials: true' ); // <-- 关键！允许发送和接收Cookie
        header( 'Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages' ); // 暴露WordPress特定的头
    }
    public function my_custom_cors_options_response() {
        if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
            status_header( 200 );
            exit();
        }
    }

    public function register_rest_routes() {
        register_rest_route('career/v1', '/user_data', array(
            'methods' => 'GET',
            'callback' => array($this, 'career_get_user_data'),
            'permission_callback' => '__return_true',
        ));
        register_rest_route('career/v1', '/user-save', [
            [
                'methods' => 'POST',
                'callback' => array($this, 'career_user_update'),
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'DELETE',
                'callback' => array($this, 'career_user_delete'),
                'permission_callback' => '__return_true',
            ]
        ]);
        register_rest_route('career/v1', '/user-feedback', [
            [
                'methods' => 'POST',
                'callback' => array($this, 'career_user_feedback'),
                'permission_callback' => '__return_true',
            ]
        ]);
        register_rest_route('career/v1', '/update_page_visits', [
            'methods' => 'POST',
            'callback' => array($this, 'update_page_visits'),
            'permission_callback' => '__return_true',
        ]);
    }

    public function update_page_visits(WP_REST_Request $request) {
        $key = sanitize_text_field($_GET['key'] ?? '');
        if (!$key) {
            return new WP_REST_Response(['success' => false, 'message' => 'No page key']);
        }
        $this->pages_increment_visit($key);
        return new WP_REST_Response(['success' => true]);
    }

    public function career_user_feedback(WP_REST_Request $request) {
        $user_id = get_current_user_id(); // 需用户已登录
        if (!$user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized ' . $user_id], 401);
        }
        $content = $request->get_param('content');

        global $wpdb;
        $table = $wpdb->base_prefix . 'career_user_feedback';
    
        $fields = [
            'user_id'     => $user_id,
            'content'   => $content
        ];
    
        $wpdb->insert($table, $fields);
        return new WP_REST_Response(['success' => true, 'data' => $content]);
    }

    
    public function career_user_delete(WP_REST_Request $request) {
        $user_id = get_current_user_id(); // 需用户已登录
        if (!$user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized ' . $user_id], 401);
        }
        global $wpdb;
        $table_raw = '';
        $table_related = '';
        $raw_item_id = $request->get_param('raw_id');
        $type = $request->get_param('type');
        if ($type === 'work_exp') {
            $table_raw = $wpdb->base_prefix . 'career_experience_raw';
            $table_related = $wpdb->base_prefix . 'career_experience_optimized';    
        } else if ($type === 'proj_exp') {
            $table_raw = $wpdb->base_prefix . 'career_project_raw';
            $table_related = $wpdb->base_prefix . 'career_project_optimized';    
        } else {
            return new WP_REST_Response(['success' => false, 'message' => 'Invalid type: '. $type], 401);
        } 
        $record_user_id = $wpdb->get_var(
            $wpdb->prepare("SELECT user_id FROM $table_raw WHERE id = %d", $raw_item_id)
        );
    
        if (!$record_user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Record not found'], 401);
        }
        if ($record_user_id != $user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Permission denied. You cannot delete this record.'], 401);
        }
        $deleted = $wpdb->delete($table_raw, ['id' => $raw_item_id], ['%d']);

        if ($deleted === false) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to delete record.'], 401);
        }
    
        // 显式尝试清除子表内容（虽然 ON DELETE CASCADE 已处理）
        $wpdb->delete($table_related, ['raw_id' => $raw_item_id], ['%d']);
        return new WP_REST_Response(['success' => true]);
    }
    public function career_user_update(WP_REST_Request $request) {
        $user_id = get_current_user_id(); // 需用户已登录
        if (!$user_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized ' . $user_id], 401);
        }

        $json_str = $request->get_param('resume_item');

        if (!$json_str) {
            return new WP_REST_Response(['error' => 'Missing resume_item parameter'], 400);
        }
    
        // 解码为 PHP 对象（第二个参数设为 true 会转成数组）
        $resume_item = json_decode($json_str, false);
    
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_REST_Response(['error' => 'Invalid JSON: ' . json_last_error_msg()], 400);
        }
    
        // 访问基本字段
        $id = $resume_item->id ?? '';
        $type = $resume_item->type ?? '';
        // $saved = $resume_item->saved ?? false;
        // $shown = $resume_item->shown ?? true;
        // $currentActivelabel = $resume_item->currentActivelabel ?? 0;
    
        // 访问 meta 字段
        $meta = $resume_item->meta ?? new stdClass();
        $project_name = $meta->project_name ?? '';
        $company_name = $meta->company_name ?? '';
        if ($type === "proj_exp" && $meta->is_customized_company_name) {
            $company_name = $meta->customized_company_name;
        }
        $time_start = $meta->time_start ?? '';
        $time_end = $meta->time_end ?? '';
        $on_going = $meta->on_going ?? false;
        $role = $meta->role ?? '';
    
        // 访问 data 列表
        $ori_data_items = $resume_item->data ?? [];
        usort($ori_data_items, function($a, $b) {
            // 假设 label 键是数值类型，进行数值比较
            return $a->label <=> $b->label; 
        });
        $sliced_items = array_slice($ori_data_items, 0, 4);
        foreach ($sliced_items as $index => &$item) { // 注意使用 & 符号进行引用传递，才能修改原数组元素
            $item->label = $index; // 将 label 赋值为当前索引 (0, 1, 2, 3...)
        }
        // 循环结束后，如果不再需要 $item 引用，最好解除绑定
        unset($item);

        $result_array = [];

        $data = [];
        $data['start_date'] = $time_start;
        $data['end_date'] = $time_end;
        $data['is_current'] = $on_going;
        $data['company_name'] = $company_name;
        $data['project_name'] = $project_name;
        $data['position'] = $role;

        $raw_id = -1;

        foreach ($sliced_items as $item) {
            $data['raw_id'] = $raw_id;
            $data['id'] = $item->id ?? 0;
            $data['op_version'] = $item->label ?? 0;
            $data['keywords_json'] = $item->key_words ?? "";
            $data['content'] = $item->resp_desc ?? "";
            $data['company_intro'] = $item->item_desc ?? "";
            $data['project_intro'] = $item->item_desc ?? "";
            $data['responsibilities'] = $item->resp_desc ?? "";
            $data['achievements'] = $item->achi_desc ?? "";
            $result_obj = new stdClass();
            $result_obj->label = $item->label ?? 0;
            $result_obj->item_desc = $item->item_desc;
            $result_obj->resp_desc = $item->resp_desc;
            $result_obj->achi_desc = $item->achi_desc;
            if ($type === "summary") {
                if($item->label === 0) {
                    $raw_id = $this->save_summary_raw($user_id, $data);
                    $result_obj->id = $raw_id;
                } else {
                    $result_obj->id = $this->save_summary_optimized($user_id, $data);
                }
            } else if ($type === "work_exp") {
                if($item->label === 0) {
                    $raw_id = $this->save_experience_raw($user_id, $data);
                    $result_obj->id = $raw_id;
                } else {
                    $result_obj->id = $this->save_experience_optimized($user_id, $data);
                }
            } else if ($type === "proj_exp") {
                if($item->label === 0) {
                    $raw_id = $this->save_project_raw($user_id, $data);
                    $result_obj->id = $raw_id;
                } else {
                    $result_obj->id = $this->save_project_optimized($user_id, $data);
                }
            }
            $result_array[] = $result_obj;
        }

        return new WP_REST_Response(['success' => true, 'idArray' => json_encode($result_array)]);
    }
    /**
     * 隐藏邮箱地址的用户名部分。
     * 显示前3个字符，中间用***代替，然后显示@及其后面的所有内容。
     * * @param string $email 原始的邮箱字符串
     * @return string 处理后的邮箱字符串
     */
    function maskEmail(string $email): string {
        // 1. 找到 '@' 符号的位置
        $atPosition = strpos($email, '@');

        // 2. 如果找不到 '@'，说明它不是一个有效的邮箱格式，直接返回原字符串
        if ($atPosition === false) {
            return $email;
        }

        // 3. 截取用户名的前三个字符
        // substr 会自动处理用户名不足3个字符的情况
        $usernamePrefix = substr($email, 0, 3);

        // 4. 截取从 '@' 开始到字符串末尾的所有内容
        $domainPart = substr($email, $atPosition);

        // 5. 拼接成最终的字符串并返回
        return $usernamePrefix . '***' . $domainPart;
    }
    public function career_get_user_data(WP_REST_Request $request) {
        global $wpdb;
        $user_id = get_current_user_id();
        // 获取当前用户对象
        $current_user = wp_get_current_user();
        
        // 从用户对象中获取电子邮件地址
        $user_email = $current_user->user_email;
        $prefix = $wpdb->base_prefix;

        // 用户基础信息
        $user_meta = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$prefix}career_user_meta WHERE user_id = %d", $user_id),
            ARRAY_A
        );

        // 总结原始及优化
        $summaries_raw = $wpdb->get_results(
            $wpdb->prepare("SELECT id, content, updated_at FROM {$prefix}career_summary_raw WHERE user_id = %d", $user_id),
            ARRAY_A
        );
        foreach ($summaries_raw as &$summary) {
            $summary['optimized'] = $wpdb->get_results(
                $wpdb->prepare("SELECT id, op_version, keywords_json, content, updated_at FROM {$prefix}career_summary_optimized WHERE raw_id = %d", $summary['id']),
                ARRAY_A
            );
        }

        // 工作经验原始及优化
        $experiences_raw = $wpdb->get_results(
            $wpdb->prepare("SELECT id, start_date, end_date, is_current, company_name, company_intro, position, responsibilities, achievements, updated_at FROM {$prefix}career_experience_raw WHERE user_id = %d ORDER By start_date", $user_id),
            ARRAY_A
        );
        foreach ($experiences_raw as &$exp) {
            $exp['optimized'] = $wpdb->get_results(
                $wpdb->prepare("SELECT id, op_version, keywords_json, company_intro, responsibilities, achievements, updated_at FROM {$prefix}career_experience_optimized WHERE raw_id = %d", $exp['id']),
                ARRAY_A
            );
        }

        // 项目经历原始及优化
        $projects_raw = $wpdb->get_results(
            $wpdb->prepare("SELECT id, start_date, end_date, is_current, project_name, company_name, project_intro, position, responsibilities, achievements, updated_at FROM {$prefix}career_project_raw WHERE user_id = %d ORDER By start_date", $user_id),
            ARRAY_A
        );
        foreach ($projects_raw as &$proj) {
            $proj['optimized'] = $wpdb->get_results(
                $wpdb->prepare("SELECT id, op_version, keywords_json, project_intro, responsibilities, achievements, updated_at FROM {$prefix}career_project_optimized WHERE raw_id = %d", $proj['id']),
                ARRAY_A
            );
        }

        return new WP_REST_Response([ 'user_data' => [
            // 'user_id'   => $user_id,
            // 'experience_len' => count($experiences_raw),
            'user_email'  => $this->maskEmail($user_email),
            'user_meta'   => $user_meta,
            'summary'   => $summaries_raw,
            'experiences' => $experiences_raw,
            'projects'    => $projects_raw,
        ]]);
    }

    public function on_activation() {
        global $wpdb;
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        $prefix = $wpdb->base_prefix;
        $charset_collate = $wpdb->get_charset_collate();
        $tables = [];

        // 1. 用户信息表
        $tables[] = "CREATE TABLE {$prefix}career_user_meta (
            user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
            nickname VARCHAR(100),
            avatar_url TEXT,
            birth_date DATE,
            gender ENUM('male', 'female', 'other') DEFAULT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            address TEXT,
            social_json LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) $charset_collate;";

        // 2. 总结表_原始
        $tables[] = "CREATE TABLE {$prefix}career_summary_raw (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            content LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) $charset_collate;";

        // 3. 总结表_优化
        $tables[] = "CREATE TABLE {$prefix}career_summary_optimized (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            raw_id BIGINT UNSIGNED NOT NULL,
            op_version INT NOT NULL,
            keywords_json LONGTEXT,
            content LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_raw_version (raw_id, op_version),
            FOREIGN KEY (raw_id) REFERENCES {$prefix}career_summary_raw(id) ON DELETE CASCADE
        ) $charset_collate;";

        // 4. 工作经验表_原始
        $tables[] = "CREATE TABLE {$prefix}career_experience_raw (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            start_date DATE,
            end_date DATE,
            is_current BOOLEAN DEFAULT FALSE,
            company_name VARCHAR(255),
            company_intro LONGTEXT,
            position VARCHAR(255),
            responsibilities LONGTEXT,
            achievements LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) $charset_collate;";

        // 5. 工作经验表_优化
        $tables[] = "CREATE TABLE {$prefix}career_experience_optimized (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            raw_id BIGINT UNSIGNED NOT NULL,
            op_version INT NOT NULL,
            keywords_json LONGTEXT,
            company_intro LONGTEXT,
            responsibilities LONGTEXT,
            achievements LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_raw_version (raw_id, op_version),
            FOREIGN KEY (raw_id) REFERENCES {$prefix}career_experience_raw(id) ON DELETE CASCADE
        ) $charset_collate;";

        // 6. 项目经历表_原始
        $tables[] = "CREATE TABLE {$prefix}career_project_raw (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            start_date DATE,
            end_date DATE,
            is_current BOOLEAN DEFAULT FALSE,
            project_name VARCHAR(255),
            company_name VARCHAR(255),
            project_intro LONGTEXT,
            position VARCHAR(255),
            responsibilities LONGTEXT,
            achievements LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) $charset_collate;";

        // 7. 项目经历表_优化
        $tables[] = "CREATE TABLE {$prefix}career_project_optimized (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            raw_id BIGINT UNSIGNED NOT NULL,
            op_version INT NOT NULL,
            keywords_json LONGTEXT,
            project_intro LONGTEXT,
            responsibilities LONGTEXT,
            achievements LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_raw_version (raw_id, op_version),
            FOREIGN KEY (raw_id) REFERENCES {$prefix}career_project_raw(id) ON DELETE CASCADE
        ) $charset_collate;";

        // 8. 页面访问计数表
        $tables[] = "CREATE TABLE {$prefix}career_page_visits (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            page_key VARCHAR(191) NOT NULL UNIQUE,
            visit_count BIGINT UNSIGNED NOT NULL DEFAULT 0
        ) $charset_collate;";

        // 9. 用户反馈信息表
        $tables[] = "CREATE TABLE {$prefix}career_user_feedback (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            content LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX user_id_idx (user_id)
        ) $charset_collate;";

        // 10. 用户注册过程表
        $tables[] = "CREATE TABLE `{$prefix}career_verification_codes` (
            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `identifier` VARCHAR(255) NOT NULL, -- 用于存储邮箱或手机号
            `code` VARCHAR(10) NOT NULL,         -- 存储验证码本身
            `token` VARCHAR(255) NULL, -- 用于密码设置环节的凭证
            `status` ENUM('pending', 'verified', 'used', 'expired') NOT NULL DEFAULT 'pending', -- 状态：待验证、已验证、已过期
            `created_at` DATETIME NOT NULL, -- 创建时间
            `expires_at` DATETIME NOT NULL,     -- 过期时间，方便查询
            INDEX `identifier_idx` (`identifier`), -- 为 identifier 添加索引以加快查询
            UNIQUE INDEX `token_idx` (`token`) -- token 应该是唯一的
        ) $charset_collate;";

        // 11. 用户遗忘密码申请表
        $tables[] = "CREATE TABLE `{$prefix}career_password_resets` (
            `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_email` VARCHAR(100) NOT NULL,
            `token_hash` VARCHAR(255) NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `created_at` TIMESTAMP NOT NULL,
            PRIMARY KEY (`id`),
            INDEX `password_resets_token_hash_index` (`token_hash`),
            INDEX `password_resets_user_email_index` (`user_email`)
        ) $charset_collate;";

        // 执行所有表创建
        foreach ($tables as $sql) {
            dbDelta($sql);
        }

    }

    public function save_user_info($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_user_meta';
    
        $exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE user_id = %d", $user_id));
    
        $fields = [
            'nickname'     => $data['nickname'] ?? '',
            'avatar_url'   => $data['avatar_url'] ?? '',
            'birth_date'   => $data['birth_date'] ?? null,
            'gender'       => $data['gender'] ?? '',
            'phone'        => $data['phone'] ?? '',
            'email'        => $data['email'] ?? '',
            'address'      => $data['address'] ?? '',
            'social_json'  => $data['social_json'] ?? '',
            'updated_at'   => current_time('mysql')
        ];
    
        if ($exists) {
            return $wpdb->update($table, $fields, [ 'user_id' => $user_id ]);
        } else {
            $fields['user_id'] = $user_id;
            $fields['created_at'] = current_time('mysql');
            return $wpdb->insert($table, $fields);
        }
    }
    
    public function save_summary_raw($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_summary_raw';
    
        $new_content = $data['content'] ?? '';
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT content FROM $table WHERE id = %d AND user_id = %d",
                $data['id'],
                $user_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and user_id {$user_id} not found.");
            }
    
            if ($existing['content'] === $new_content) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'content'    => $new_content,
                'updated_at' => $now
            ], [ 'id' => $data['id'], 'user_id' => $user_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            $wpdb->delete($table, array('user_id' => $user_id), array('%d'));
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'user_id'    => $user_id,
                'content'    => $new_content,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }
    
    public function save_summary_optimized($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_summary_optimized';
    
        $new_content = $data['content'] ?? '';
        $key_word = $data['keywords_json'] ?? '';
        $raw_id = $data['raw_id'] ?? '';
        $op_version = $data['op_version'] ?? 0;
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT content, keywords_json, op_version FROM $table WHERE id = %d AND raw_id = %d",
                $data['id'],
                $raw_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and raw_id {$raw_id} not found.");
            }
    
            if ($existing['content'] === $new_content &&
                $existing['keywords_json'] === $key_word &&
                $existing['op_version'] === $op_version) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'content'    => $new_content,
                'op_version'    => $op_version,
                'updated_at' => $now,
                'keywords_json' => $key_word
            ], [ 'id' => $data['id'], 'raw_id' => $raw_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'raw_id'    => $raw_id,
                'op_version'    => $op_version,
                'content'    => $new_content,
                'keywords_json' => $key_word,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }
    
    public function save_experience_raw($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_experience_raw';

        $start_date = $data['start_date'];
        $end_date = $data['end_date'];
        $is_current = $data['is_current'];
        $position = $data['position'];
        $company_name = $data['company_name'];
        $company_intro = $data['company_intro'];
        $responsibilities = $data['responsibilities'];
        $achievements = $data['achievements'];
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT start_date, end_date, is_current, company_name, company_intro, position, responsibilities, achievements FROM $table WHERE id = %d AND user_id = %d",
                $data['id'],
                $user_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and user_id {$user_id} not found.");
            }
    
            if ($existing['start_date'] === $start_date &&
                $existing['end_date'] === $end_date &&
                $existing['is_current'] === $is_current &&
                $existing['company_name'] === $company_name &&
                $existing['position'] === $position &&
                $existing['company_intro'] === $company_intro &&
                $existing['responsibilities'] === $responsibilities &&
                $existing['achievements'] === $achievements) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'is_current' => $is_current,
                'company_name' => $company_name,
                'position' => $position,
                'company_intro' => $company_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'updated_at' => $now
            ], [ 'id' => $data['id'], 'user_id' => $user_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'user_id'    => $user_id,
                'start_date' => $start_date,
                'end_date' => $end_date,
                'is_current' => $is_current,
                'company_name' => $company_name,
                'position' => $position,
                'company_intro' => $company_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }
    
    public function save_experience_optimized($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_experience_optimized';
    
        $company_intro = $data['company_intro'];
        $responsibilities = $data['responsibilities'];
        $achievements = $data['achievements'];
        $key_word = $data['keywords_json'] ?? '';
        $raw_id = $data['raw_id'] ?? '';
        $op_version = $data['op_version'] ?? 0;
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT company_intro, responsibilities, achievements, keywords_json, raw_id FROM $table WHERE id = %d AND raw_id = %d",
                $data['id'],
                $raw_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and raw_id {$raw_id} not found.");
            }
    
            if ($existing['company_intro'] === $company_intro &&
                $existing['responsibilities'] === $responsibilities &&
                $existing['achievements'] === $achievements &&
                $existing['keywords_json'] === $key_word &&
                $existing['op_version'] === $op_version) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'company_intro' => $company_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'op_version'    => $op_version,
                'updated_at' => $now,
                'keywords_json' => $key_word
            ], [ 'id' => $data['id'], 'raw_id' => $raw_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'raw_id'    => $raw_id,
                'op_version'    => $op_version,
                'company_intro' => $company_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'keywords_json' => $key_word,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }
    
    public function save_project_raw($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_project_raw';
    
        $start_date = $data['start_date'];
        $end_date = $data['end_date'];
        $is_current = $data['is_current'];
        $position = $data['position'];
        $project_name = $data['project_name'];
        $company_name = $data['company_name'];
        $project_intro = $data['project_intro'];
        $responsibilities = $data['responsibilities'];
        $achievements = $data['achievements'];
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT start_date, end_date, is_current, project_name, company_name, project_intro, position, responsibilities, achievements FROM $table WHERE id = %d AND user_id = %d",
                $data['id'],
                $user_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and user_id {$user_id} not found.");
            }
    
            if ($existing['start_date'] === $start_date &&
                $existing['end_date'] === $end_date &&
                $existing['is_current'] === $is_current &&
                $existing['company_name'] === $company_name &&
                $existing['position'] === $position &&
                $existing['project_name'] === $project_name &&
                $existing['project_intro'] === $project_intro &&
                $existing['responsibilities'] === $responsibilities &&
                $existing['achievements'] === $achievements) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'start_date' => $start_date,
                'end_date' => $end_date,
                'is_current' => $is_current,
                'project_name' => $project_name,
                'company_name' => $company_name,
                'position' => $position,
                'project_intro' => $project_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'updated_at' => $now
            ], [ 'id' => $data['id'], 'user_id' => $user_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'user_id'    => $user_id,
                'start_date' => $start_date,
                'end_date' => $end_date,
                'is_current' => $is_current,
                'company_name' => $company_name,
                'position' => $position,
                'project_name' => $project_name,
                'project_intro' => $project_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }
    
    public function save_project_optimized($user_id, $data) {
        global $wpdb;
        $table = $wpdb->base_prefix . 'career_project_optimized';
    
        $project_intro = $data['project_intro'];
        $responsibilities = $data['responsibilities'];
        $achievements = $data['achievements'];
        $key_word = $data['keywords_json'] ?? '';
        $raw_id = $data['raw_id'] ?? '';
        $op_version = $data['op_version'] ?? 0;
        $now = current_time('mysql');
    
        if (!empty($data['id'])) {
            // 更新逻辑
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT project_intro, responsibilities, achievements, keywords_json, raw_id, op_version FROM $table WHERE id = %d AND raw_id = %d",
                $data['id'],
                $raw_id
            ), ARRAY_A);
    
            if (!$existing) {
                throw new Exception("Record with id {$data['id']} and raw_id {$raw_id} not found.");
            }
    
            if ($existing['project_intro'] === $project_intro &&
                $existing['responsibilities'] === $responsibilities &&
                $existing['achievements'] === $achievements &&
                $existing['keywords_json'] === $key_word &&
                $existing['op_version'] === $op_version) {
                return $data['id']; // 无需更新
            }
    
            $updated = $wpdb->update($table, [
                'project_intro' => $project_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'op_version'    => $op_version,
                'updated_at' => $now,
                'keywords_json' => $key_word
            ], [ 'id' => $data['id'], 'raw_id' => $raw_id ]);
    
            if ($updated === false) {
                throw new Exception("Failed to update record with id {$data['id']}.");
            }
    
            return $data['id'];
        } else {
            // 插入逻辑
            $inserted = $wpdb->insert($table, [
                'raw_id'    => $raw_id,
                'op_version'    => $op_version,
                'project_intro' => $project_intro,
                'responsibilities' => $responsibilities,
                'achievements' => $achievements,
                'keywords_json' => $key_word,
                'created_at' => $now,
                'updated_at' => $now
            ]);
    
            if ($inserted === false) {
                throw new Exception("Failed to insert new record.");
            }
    
            return $wpdb->insert_id;
        }
    }

    public function pages_increment_visit($page_key) {
        global $wpdb;
        $table_name = $wpdb->base_prefix . 'career_page_visits';
    
        $exists = $wpdb->get_var($wpdb->prepare("SELECT visit_count FROM $table_name WHERE page_key = %s", $page_key));
    
        if ($exists === null) {
            $wpdb->insert($table_name, [
                'page_key' => $page_key,
                'visit_count' => 1
            ]);
        } else {
            $wpdb->query($wpdb->prepare("UPDATE $table_name SET visit_count = visit_count + 1 WHERE page_key = %s", $page_key));
        }
    }
}    
$resumeOptimizer = new ResumeOptimizer();
?>
