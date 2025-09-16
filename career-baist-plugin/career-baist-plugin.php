<?php
/*
Plugin Name: Career Baist Optimizer
Description: Adds a React-based Guest Optimize Page to WordPress.
Version: 1.0
Author: Dif
*/

if (!defined('ABSPATH')) {
    exit;
}

require_once ABSPATH . 'wp-includes/pluggable.php';
// require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';
// use \Firebase\JWT\JWT;

function cbo_enqueue_assets() {
    $plugin_url = plugin_dir_url(__FILE__);

    // 加载WordPress核心脚本
    wp_enqueue_script('wp-api');
    wp_enqueue_script('wp-i18n');
    wp_enqueue_script('wp-polyfill');
    wp_enqueue_script('wp-hooks');
    wp_enqueue_script('wp-components');
    wp_enqueue_script('wp-element');
    wp_enqueue_script('wp-api-fetch');
    
    // 确保jQuery正确加载
    wp_enqueue_script('jquery');
    wp_enqueue_script('jquery-migrate');


    // 加载React相关依赖
    wp_enqueue_script('react');
    wp_enqueue_script('react-dom');

    // 加载Redux相关依赖
    wp_enqueue_script(
        'redux-toolkit',
        'https://cdn.jsdelivr.net/npm/@reduxjs/toolkit@2.8.1/dist/redux-toolkit.umd.min.js',
        array(),
        null,
        true
    );
    wp_enqueue_script(
        'react-redux',
        'https://cdn.jsdelivr.net/npm/react-redux@9.2.0/dist/react-redux.min.js',
        array('react', 'redux-toolkit'),
        null,
        true
    );
    wp_enqueue_script(
        'redux-persist',
        'https://cdn.jsdelivr.net/npm/redux-persist@6.0.0/lib/index.umd.js',
        array('redux-toolkit'),
        null,
        true
    );

    // 加载Tailwind CSS
    wp_enqueue_style(
        'cbo-style',
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        array(),
        null
    );

    // 加载本地CSS
    if (file_exists(plugin_dir_path(__FILE__) . 'assets/style.css')) {
        wp_enqueue_style(
            'cbo-style-local',
            $plugin_url . 'assets/style.css',
            array(),
            null
        );
    }

    // 加载React应用
    wp_enqueue_script(
        'career-baist-frontend',
        $plugin_url . 'assets/main.js',
        array(
            'wp-api',
            'wp-i18n',
            'wp-polyfill',
            'wp-hooks',
            'wp-components',
            'wp-element',
            'wp-api-fetch',
            'react',
            'react-dom',
            'jquery',
            'redux-toolkit',
            'react-redux',
            'redux-persist'
        ),
        null,
        true
    );

    // 设置国际化
    if (function_exists('wp_set_script_translations')) {
        wp_set_script_translations(
            'career-baist-frontend',
            'career-baist-texts',
            plugin_dir_path(__FILE__) . 'languages'
        );
    }
    wp_add_inline_script('career-baist-frontend', 'window.PLUGIN_BASE_URL = "' . plugin_dir_url(__FILE__) . '";', 'before');

    // 添加全局变量
    wp_localize_script('career-baist-frontend', 'careerBaistData', array(
        'baseUrl' => plugin_dir_url(__FILE__),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('wp_rest'),
        'i18n' => array(
            'domain' => 'career-baist-texts',
            'locale' => get_locale(),
            'translations' => array(
                'domain' => 'career-baist-texts',
                'locale_data' => array(
                    'career-baist-texts' => array(
                        '' => array(
                            'domain' => 'career-baist-texts',
                            'lang' => get_locale()
                        )
                    )
                )
            )
        )
    ));

    // 确保i18n在页面加载时初始化
    wp_add_inline_script('career-baist-frontend', '
        if (window.wp && window.wp.i18n) {
            window.wp.i18n.setLocaleData(window.careerBaistData.i18n);
        }
    ', 'after');
}
add_action('wp_enqueue_scripts', 'cbo_enqueue_assets');

add_action('init', function () {
    add_role('job_seeker', 'Job Seeker', [
        'read' => true,
        'edit_posts' => false,
    ]);
});
// 注册 URL 重写规则：访问 my_career_baist 时加载该页面
add_action('init', function () {
    add_rewrite_rule('^my_career_baist$', 'index.php?career_baist_page=1', 'top');
});

// 添加自定义 query var
add_filter('query_vars', function ($vars) {
    $vars[] = 'career_baist_page';
    return $vars;
});

// 渲染页面内容（从打包好的 resume-frontend/index.html 中加载）
// add_action('template_redirect', function () {
//     if (get_query_var('career_baist_page')) {

//         // @todo: JWT 登录校验逻辑，暂时注释
//         /*
//         $token = $_COOKIE['jwt_token'] ?? null;
//         if (!$token || !is_valid_jwt($token)) {
//             wp_redirect(home_url('/login'));
//             exit;
//         }
//         */

//         $assets_url = plugin_dir_url(__FILE__) . 'resume-frontend/';
//         $html_file = plugin_dir_path(__FILE__) . 'resume-frontend/index.html';

//         if (file_exists($html_file)) {
//             $html = file_get_contents($html_file);
//             // 替换静态资源路径
//             $html = str_replace('/assets/', $assets_url . 'assets/', $html);
//             echo $html;
//         } else {
//             status_header(500);
//             echo '<h1>Frontend build not found.</h1>';
//         }

//         exit;
//     }
// });

// （可选）刷新 URL 重写规则（首次激活插件时）
register_activation_hook(__FILE__, function () {
    flush_rewrite_rules();
});
register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
});

/*
// @todo: JWT 校验函数（待启用）
function is_valid_jwt($token) {
    // 验证 JWT 是否有效的逻辑
    return true;
}
*/
function cbo_render_guest_optimize() {
    return '<div id="guest-optimize-root"></div>';
}
add_shortcode('guest_optimize', 'cbo_render_guest_optimize');

function shortcode_dashboard_page() {
    return '<div id="dashboard-page"></div>';
  }
add_shortcode('dashboard_page', 'shortcode_dashboard_page');
function my_reset_password_shortcode_handler() {
    return '<div id="reset-password"></div>';
}
add_shortcode( 'reset-password', 'my_reset_password_shortcode_handler' );

add_action('rest_api_init', function () {

    // remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    // add_filter('rest_pre_serve_request', function ($value) {
    //     header('Access-Control-Allow-Origin: *'); // 或指定你的前端域名
    //     header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    //     header('Access-Control-Allow-Headers: Authorization, Content-Type');
    //     return $value;
    // });

    register_rest_route('career/v1', '/send-code', [
        'methods' => 'POST',
        'callback' => 'career_send_verification_code',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/verify-code', [
        'methods' => 'POST',
        'callback' => 'career_verify_code',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/register', [
        'methods' => 'POST',
        'callback' => 'career_register_user',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/login', [
        'methods' => 'POST',
        'callback' => 'career_login_user',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/send-reset-pwd-email', [
        'methods' => 'POST',
        'callback' => 'career_send_reset_pwd_email',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/verify-reset-pwd-token', [
        'methods' => 'POST',
        'callback' => 'career_verify_reset_pwd_token',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/reset-pwd-by-email', [
        'methods' => 'POST',
        'callback' => 'career_reset_pwd_by_email',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/optimize_guest', [
        'methods' => 'POST',
        'callback' => 'optimize_from_guest',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/optimize_user', [
        'methods' => 'POST',
        'callback' => 'optimize_from_user',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/modify_pwd', [
        'methods' => 'POST',
        'callback' => 'career_modify_password',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/logout', [
        'methods' => 'POST',
        'callback' => 'career_logout_user',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('career/v1', '/roles', [
        'methods' => 'GET',
        'callback' => 'career_get_roles',
        'permission_callback' => '__return_true',
    ]);
    
});


function career_send_reset_pwd_email( WP_REST_Request $request) {
    $email = sanitize_email( $request->get_param('email') );

    // 1. 验证用户是否存在
    $user = get_user_by( 'email', $email );
    if ( ! $user ) {
        // 出于安全，不要提示“用户不存在”，而是返回一个通用的成功信息
        // 这可以防止攻击者用它来探测哪些邮箱是注册过的
        return new WP_REST_Response( ['message' => 'If an account with this email exists, a password reset link has been sent.'], 200 );
    }

    // 5. 将信息存入我们的新表
    global $wpdb;
    $table_name = $wpdb->base_prefix . 'career_password_resets';

    // 1. 检查该邮箱是否已有重置记录
    $existing_record = $wpdb->get_row( $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_email = %s",
        $email
    ) );

    $current_timestamp_utc = current_time('timestamp', true);

    if ( $existing_record ) {
        // 2. 如果有记录，检查频率
        $created_timestamp = strtotime( $existing_record->created_at );
        $time_diff = $current_timestamp_utc - $created_timestamp;

        if ( $time_diff < 60 ) {
            // 距离上次请求不足1分钟，返回错误
            $wait_time = 60 - $time_diff;
            return new WP_Error(
                'too_many_requests',
                'You can request a new link in ' . $wait_time . ' seconds.',
                ['status' => 429] // 429 Too Many Requests 是标准的HTTP状态码
            );
        }
        
        // 3. 如果超过1分钟，准备更新现有记录 (让旧Token作废)
        $is_update = true;

    } else {
        // 4. 如果没有记录，准备插入新记录
        $is_update = false;
    }

    $token = bin2hex( random_bytes(32) );
    $token_hash = hash( 'sha256', $token );
    $current_mysql_time = date('Y-m-d H:i:s', $current_timestamp_utc);
    $expires_at = date('Y-m-d H:i:s', $current_timestamp_utc + (10 * 60)); // 10分钟后过期

    // --- 根据情况执行数据库操作 ---
    if ( $is_update ) {
        // 更新记录
        $wpdb->update(
            $table_name,
            [
                'token_hash' => $token_hash,
                'created_at' => $current_mysql_time,
                'expires_at' => $expires_at,
            ],
            ['user_email' => $email] // WHERE 条件
        );
    } else {
        // 插入新记录
        $wpdb->insert(
            $table_name,
            [
                'user_email' => $email,
                'token_hash' => $token_hash,
                'created_at' => $current_mysql_time,
                'expires_at' => $expires_at,
            ]
        );
    }

    // 6. 构建指向您自定义前端页面的链接
    // **注意：邮件中发送的是原始的、未哈希的$token**
    $reset_link = 'https://career.nonpareil.me/reset-password?token=' . $token;
    // $reset_link = 'https://localhost/reset-password?token=' . $token;

    // 7. 发送邮件
    $subject = 'Your Password Reset Link';
    $body = "Please click on the following link to reset your password:\n" . $reset_link . "\n\nLink will be expired in 10 miutes.";
    wp_mail( $email, $subject, $body );

    return new WP_REST_Response( ['message' => 'A password reset link has been sent.'], 200 );
}
function career_verify_reset_pwd_token( WP_REST_Request $request) {
    $token = sanitize_text_field( $request->get_param('token') );

    // 1. 哈希接收到的Token，以便和数据库中的哈希值进行比较
    $token_hash = hash( 'sha256', $token );

    // 2. 查询数据库
    global $wpdb;
    $table_name = $wpdb->base_prefix . 'career_password_resets';

    $record = $wpdb->get_row( $wpdb->prepare(
        "SELECT * FROM $table_name WHERE token_hash = %s",
        $token_hash
    ) );
    $current_utc_time = current_time('timestamp', true);
    $expires_timestamp = $record ? strtotime( $record->expires_at ) : 0;

    // 3. 验证记录是否存在且未过期
    if ( ! $record || $current_utc_time > $expires_timestamp ) {
        // 如果记录不存在或已过期，立即使其失效（可选但推荐）
        if ($record) {
            $wpdb->delete($table_name, ['id' => $record->id]);
        }
        return new WP_Error( 'invalid_token', 'This password reset link is invalid or has expired.', ['status' => 400, 'relocateTo' => 'welcome'] );
    }

    // Token有效，授权前端显示密码输入框
    return new WP_REST_Response( ['message' => 'Token is valid.'], 200 );
}
function career_reset_pwd_by_email( WP_REST_Request $request) {
    $token        = sanitize_text_field( $request->get_param('token') );
    $new_password = $request->get_param('password'); // 假设前端已做强度验证

    if (!validate_password($new_password)) {
        return new WP_Error(
            'password_too_weak',
            'Password too weak.',
            ['status' => 400]
        );
    }
    // 1. 再次验证Token的有效性（非常重要，防止重放攻击）
    $token_hash = hash( 'sha256', $token );
    global $wpdb;
    $table_name = $wpdb->base_prefix . 'career_password_resets';
    $record = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE token_hash = %s", $token_hash ) );

    $current_timestamp = current_time('timestamp', true);
    $expires_timestamp = $record ? strtotime( $record->expires_at ) : 0;

    if ( ! $record || $current_timestamp > $expires_timestamp ) {
        return new WP_Error( 'invalid_token', 'This password reset link is invalid or has expired.', ['status' => 400] );
    }

    // 2. 获取用户信息并更新密码
    $user = get_user_by( 'email', $record->user_email );
    if ($user) {
        wp_set_password( $new_password, $user->ID );
    }

    // 3. 【关键】删除已使用的Token，使其立即失效
    $wpdb->delete( $table_name, array( 'id' => $record->id ) );

    return new WP_REST_Response( [
        'message' => 'Your password has been reset successfully.',
        'relocateTo' => 'welcome'
    ], 200 );
}
/**
 * 处理密码修改请求的回调函数.
 *
 * @param WP_REST_Request $request The request object.
 * @return WP_REST_Response|WP_Error
 */
function career_modify_password( WP_REST_Request $request ) {
    // 1. 安全性检查：验证Nonce
    $nonce = $request->get_header( 'X-WP-Nonce' );
    if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
        return new WP_Error(
            'rest_nonce_invalid',
            __( 'Nonce is invalid.', 'my-text-domain' ),
            array( 'status' => 403 ) // 403 Forbidden
        );
    }

    // 2. 获取当前用户
    $user = wp_get_current_user();
    if ( 0 === $user->ID ) {
        return new WP_Error(
            'rest_not_logged_in',
            __( 'You are not currently logged in.', 'my-text-domain' ),
            array( 'status' => 401 ) // 401 Unauthorized
        );
    }

    // 3. 从请求中获取并清理数据
    $params = $request->get_json_params();
    $old_password = isset( $params['old_password'] ) ? sanitize_text_field( $params['old_password'] ) : '';
    $new_password = isset( $params['new_password'] ) ? sanitize_text_field( $params['new_password'] ) : '';

    if ( empty( $old_password ) || empty( $new_password ) ) {
        return new WP_Error(
            'rest_missing_passwords',
            __( 'Old password and new password are required.', 'my-text-domain' ),
            array( 'status' => 400 ) // 400 Bad Request
        );
    }

    if ( $old_password === $new_password ) {
        return new WP_Error(
            'rest_missing_passwords',
            __( 'Old password and new password should not be the same.', 'my-text-domain' ),
            array( 'status' => 400 ) // 400 Bad Request
        );
    }

    // 4. 验证旧密码是否正确
    // wp_check_password() 需要未哈希的密码和用户的哈希密码进行比较
    if ( ! wp_check_password( $old_password, $user->user_pass, $user->ID ) ) {
        return new WP_Error(
            'rest_old_password_incorrect',
            __( 'The old password you entered is incorrect.', 'my-text-domain' ),
            array( 'status' => 403 ) // 403 Forbidden
        );
    }

    // 5. 验证新密码强度
    if (!validate_password($new_password)) {
        return new WP_Error(
            'password_too_weak',
            'Password too weak.',
            ['status' => 400]
        );
    }

    // 6. 所有验证通过，更新密码
    // wp_set_password() 会自动处理哈希
    wp_set_password( $new_password, $user->ID );

    // (可选) 更新后，登出用户所有其他会话
    wp_destroy_other_sessions();

    // 7. 返回成功响应
    return new WP_REST_Response( array(
        'success' => true,
        'message' => __( 'Password changed successfully.', 'my-text-domain' ),
        'relocateTo' => 'welcome'
    ), 200 ); // 200 OK
}

function career_logout_user($request) {
    // 清除认证 Cookie
    wp_logout();

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Logged out successfully.',
        'relocateTo' => 'welcome'
    ], 200);
}

function send_verification_email($email, $verification_code) {
    $subject = 'Verification Code From nonpareil.me';
    $body = "Your verification code is: {$verification_code}.\nPlease enter in 10 minutes.";

    return wp_mail($email, $subject, $body);
}

function career_verify_code($request) {
    // 1. 准备工作和输入验证
    global $wpdb;
    $table_name = $wpdb->base_prefix . 'career_verification_codes';

    $email = sanitize_email($request->get_param('email'));
    $code = sanitize_text_field($request->get_param('code'));

    if (empty($email) || empty($code)) {
        return new WP_Error(
            'bad_request',
            'Email or verification code invalid.',
            ['status' => 400]
        );
    }

    // 2. 构造数据库查询
    // 我们需要查找一个完全匹配、状态为“待验证”且尚未过期的记录
    $current_utc_time = current_time('mysql', true);
    $sql = $wpdb->prepare(
        "SELECT id, identifier FROM {$table_name} WHERE identifier = %s AND code = %s AND status = 'pending' AND expires_at > %s LIMIT 1",
        $email,
        $code,
        $current_utc_time
    );

    $verification_record = $wpdb->get_row($sql);

    // 3. 处理验证失败
    if (empty($verification_record)) {
        // 如果找不到匹配的记录，说明验证码错误、已使用或已过期
        return new WP_Error(
            'invalid_or_expired_code',
            'Verification code is wrong or expired, please try again.',
            ['status' => 401] // 使用 400 Bad Request 或 401 Unauthorized 均可
        );
    }

    // 4. 处理验证成功
    // 生成一个用于下一步（设置密码）的、一次性的、安全的临时令牌
    // wp_generate_password 是一个很好的随机字符串生成器
    $set_password_token = wp_generate_password(64, false);

    // 计算设置密码环节的过期时间（例如，10分钟后）
    $new_expires_at = date('Y-m-d H:i:s', current_time('timestamp', true) + (10 * 60));


    // 更新数据库记录：标记为已验证，并存入新令牌和新过期时间
    $update_result = $wpdb->update(
        $table_name,
        [
            'status'     => 'verified',
            'token'      => $set_password_token,
            'expires_at' => $new_expires_at
        ],
        [
            'id' => $verification_record->id // WHERE 条件
        ],
        [
            '%s', // status
            '%s', // token
            '%s'  // expires_at
        ],
        [
            '%d' // WHERE id
        ]
    );

    if ($update_result === false) {
        return new WP_Error(
            'db_update_error',
            'Unable to update the verification status, please try again later.',
            ['status' => 500]
        );
    }

    // 5. 将临时令牌返回给前端
    return new WP_REST_Response(
        [
            'success' => true,
            'message' => 'Verification success. Please set your password.',
            'setPasswordToken' => $set_password_token // 将令牌发给前端
        ],
        200
    );
}
function career_send_verification_code($request) {
    // 2. 获取和验证输入
    $email = sanitize_email($request->get_param('email'));
    if (!is_email($email)) {
        return new WP_Error(
            'invalid_email',
            'Please input a valid email address.',
            ['status' => 400]
        );
    }
    if (email_exists($email)) {
        return new WP_Error(
            'email_exists',
            'User has joined. Please LOGIN or change the email address.',
            ['status' => 409] // 409 Conflict 表示资源已存在
        );
    }

    // 1. 准备工作：获取 WordPress 数据库操作对象
    global $wpdb;
    $table_name = $wpdb->base_prefix . 'career_verification_codes';

    // 3. 查询最近的发送记录，以进行频率限制
    $last_sent_time_sql = $wpdb->prepare(
        "SELECT created_at FROM {$table_name} WHERE identifier = %s ORDER BY created_at DESC LIMIT 1",
        $email
    );
    $last_sent_time = $wpdb->get_var($last_sent_time_sql);

    // 4. 实现“1分钟内”的频率限制逻辑
    if ($last_sent_time) {
        $current_timestamp = current_time('timestamp', true);
        $date_obj = new DateTime($last_sent_time, new DateTimeZone('UTC'));
        $last_sent_timestamp = $date_obj->getTimestamp();
        $time_diff = $current_timestamp - $last_sent_timestamp;

        if ($time_diff < 60) {
            $retry_after = 60 - $time_diff;
            // 返回 429 错误，并告诉前端还需要等多少秒
            return new WP_Error(
                'too_many_requests',
                'Too many requests in a short period. Please try again shortly.',
                [
                    'status'      => 429,
                    'retry_after' => $retry_after
                ]
            );
        }
    }

    // 5. 生成并存储新验证码
    $verification_code = random_int(100000, 999999); // 生成一个6位数的随机码
    $created_at = current_time('mysql', true);
    $expires_at = date('Y-m-d H:i:s', current_time('timestamp', true) + (10 * 60));

    // 在这里调用你已经实现的邮件发送函数
    $mail_sent = send_verification_email($email, $verification_code);

    if (!$mail_sent) {
        return new WP_Error(
            'email_send_failed',
            'Failed to send mail, please retry later',
            ['status' => 500]
        );
    }
    
    // 将新验证码信息插入数据库
    $insert_result = $wpdb->insert(
        $table_name,
        [
            'identifier' => $email,
            'code'       => $verification_code,
            'created_at' => $created_at,
            'expires_at' => $expires_at,
            'status'     => 'pending' // 初始状态为待验证
        ],
        [
            '%s', // identifier
            '%s', // code
            '%s',
            '%s', // expires_at
            '%s'  // status
        ]
    );

    if ($insert_result === false) {
        // 数据库插入失败，这是一个服务器内部错误
        return new WP_Error(
            'db_insert_error',
            'Failed to save verification code, please try again later.',
            ['status' => 500]
        );
    }

    // 6. 成功响应
    return new WP_REST_Response(['message' => 'Verification sent, please check your mailbox.'], 200);
}

function validate_password($password) {
    // 至少一个小写字母、一个大写字母、一个数字，且长度不少于8
    $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/';
    return preg_match($pattern, $password) === 1;
}

function career_register_user($request) {
        // 1. 获取和验证输入
        global $wpdb;
        $table_name = $wpdb->base_prefix . 'career_verification_codes';
    
        $token = sanitize_text_field($request->get_param('token'));
        $password = $request->get_param('password'); // 密码不需要 sanitize，因为我们会哈希它
    
        if (empty($token) || empty($password)) {
            return new WP_Error(
                'bad_request',
                'Invalid password.',
                ['status' => 400]
            );
        }
    
        // 密码强度校验（可选，但强烈推荐）
        if (!validate_password($password)) {
            return new WP_Error(
                'password_too_weak',
                'Password too weak.',
                ['status' => 400]
            );
        }
    
        // 2. 验证令牌的有效性
        $current_utc_time = current_time('mysql', true);
        $sql = $wpdb->prepare(
            "SELECT id, identifier FROM {$table_name} WHERE token = %s AND status = 'verified' AND expires_at > %s LIMIT 1",
            $token,
            $current_utc_time
        );
        $token_record = $wpdb->get_row($sql);
        // error_log('Setpwd: token: ' . $token);
        // error_log('Setpwd: pwd: ' . $password);
        // error_log('Setpwd: currTime: ' . $current_utc_time);
        // error_log('Setpwd Failed: ' . $wpdb->last_error);
        if (empty($token_record)) {
            // 如果找不到，说明令牌无效、已使用或已过期
            return new WP_Error(
                'invalid_or_expired_token',
                'Operation expired. Please try again.',
                ['status' => 401] // 401 Unauthorized 更符合凭证无效的场景
            );
        }
    
        $email = $token_record->identifier;
    
        // 3. 检查用户是否已存在
        if (email_exists($email)) {
            return new WP_Error(
                'email_exists',
                'User has joined. Please LOGIN or change the email address.',
                ['status' => 409] // 409 Conflict 表示资源已存在
            );
        }
    
        // 4. 创建新用户
        $user_data = [
            'user_login' => $email,
            'user_email' => $email,
            'user_pass'  => $password, // wp_insert_user 会自动处理密码哈希
            'display_name' => explode('@', $email)[0] // 可选：用邮箱前缀作为默认显示名
        ];
        
        $user_id = wp_insert_user($user_data);
    
        if (is_wp_error($user_id)) {
            // 如果 WordPress 创建用户失败
            return $user_id; // 直接返回 WP_Error 对象
        }
    
        // 5. 使令牌失效，防止重复使用
        $wpdb->update(
            $table_name,
            [
                'status' => 'used', // 标记为已使用
                'token'  => null   // 清空 token
            ],
            ['id' => $token_record->id]
        );
    
        // 6. (可选，但强烈推荐) 自动为新用户登录
        $creds = [
            'user_login'    => $email,
            'user_password' => $password,
            'remember'      => true // 设置为 true，让登录状态保持更久
        ];
        $signon_result = wp_signon($creds, false);
    
        if (is_wp_error($signon_result)) {
            // 即使用户创建成功，但自动登录失败了，也可以只返回成功信息，让用户手动登录
            // 这里我们选择忽略登录失败，因为主流程（注册）已经成功
        }
    
        // 7. 返回最终的成功响应
        return new WP_REST_Response(
            [
                'success' => true,
                'message' => 'Welcome!',
                'email' => $email,
                'relocateTo' => 'my_career'
            ],
            201 // 201 Created 表示资源创建成功
        );
}

function career_login_user($request) {
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];
    $rememberMe = $params['rememberme'];
    
    // error_log('Login attempt for email: ' . $email);
    
    $user = wp_authenticate($email, $password);
    if (is_wp_error($user)) {
        // error_log('Authentication failed: ' . $user->get_error_message());
        return new WP_REST_Response(['success' => false, 'message' => 'Invalid credentials.'], 403);
    }

    try {
        // $issuedAt = time();
        // error_log('Issued at: ' . $issuedAt);
        
        // $expirationTime = $issuedAt + ($rememberMe ? 30 * DAY_IN_SECONDS : DAY_IN_SECONDS);
        // error_log('Expiration time: ' . $expirationTime);
        
        // $payload = [
        //     'iat' => $issuedAt,
        //     'exp' => $expirationTime,
        //     'user' => [
        //         'id' => $user->ID,
        //         'email' => $user->user_email,
        //         'name' => $user->display_name,
        //     ]
        // ];
        // error_log('Payload: ' . json_encode($payload));

        // if (!defined('JWT_AUTH_SECRET_KEY')) {
            // error_log('JWT_AUTH_SECRET_KEY is not defined');
            // throw new Exception('JWT_AUTH_SECRET_KEY is not defined');
        // }

        // $jwt = JWT::encode($payload, JWT_AUTH_SECRET_KEY, 'HS256');
        // error_log('JWT generated successfully');
        wp_set_auth_cookie($user->ID, $rememberMe);
        return new WP_REST_Response([
            'success' => true,
            // 'jwt' => $jwt,
            'relocateTo' => 'my_career',
            'user' => [
                'id' => $user->ID,
                'email' => $user->user_email,
                'name' => $user->display_name,
            ]
        ], 200);
    } catch (Exception $e) {
        // error_log('Token generation failed: ' . $e->getMessage());
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Token generation failed: ' . $e->getMessage()
        ], 500);
    }
}
function generate_text_from_huggingface($input_text) {
    // function generate_text_from_huggingface($api_token, $model_id, $input_text) {
    // $url = "https://api-inference.huggingface.co/models/$model_id";
    $url = cbi_get_hugging_face_api_url(); // "https://router.huggingface.co/novita/v3/openai/chat/completions";
    $token = cbi_get_hugging_face_api_token();
    $headers = [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ];
    $data = [
        "messages" => [
            [
                "role" => "user",
                "content" => $input_text
            ]
        ],
        "model" => "deepseek/deepseek-v3-0324",
        "stream" => false
    ];
    // $data = [
    //     "inputs" => $input_text,
    //     "parameters" => [
    //         "max_length" => 500, // 你可以根据需要调整最大长度
    //         "num_return_sequences" => 1
    //     ]
    // ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    // curl_setopt($ch, CURLOPT_VERBOSE, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    $response = curl_exec($ch);

    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    $result = "";

    $error_not_happened = FALSE;

    if (curl_errno($ch)) {
        $result = 'cURL Error: ' . curl_error($ch);
    } elseif ($http_code !== 200) {
        $result = "HTTP Error: $http_code\nResponse: $response";
    } else {
        $error_not_happened = TRUE;
        $result = $response;
    }
    curl_close($ch);
    if($error_not_happened) {
        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $result =  'JSON Decode Error: ' . json_last_error_msg();
        }
    }
    return $result;
}

function optimize_from_guest($request) {
    $params = $request->get_json_params();
    $input_text = sanitize_text_field($params['text']);
    $prompt_keep_format_template_en = <<<EOT
You are a Human Resource Manager.
I will provide text about my summary or work experience or project experience.
Optimize the text for my resume in the way you would like.
No format, no added information, just the result of pure text.
Original Text:
%s
EOT;    
    $prompt_text = sprintf($prompt_keep_format_template_en, $input_text);
    
    $result = generate_text_from_huggingface($prompt_text);
    $success = true;
    if (isset($result['choices'][0]['message']['content'])) {
        $output = $result['choices'][0]['message']['content'];
        $success = true;
    } else {
        $output = "Failed to generate text.";// . json_encode($result);
        $success = false;
    }

    return new WP_REST_Response([
        'success' => $success,
        'output' => $output
    ], 200);
}

// 获取 recruitment_roles.json 文件的内容
function get_recruitment_roles_json() {
    static $recruitment_roles_cached_json = null;

    if ($recruitment_roles_cached_json !== null) {
        return $recruitment_roles_cached_json;
    }

    $plugin_dir = plugin_dir_path(__FILE__);
    $json_file = $plugin_dir . 'res/recruitment_roles.json';

    if (file_exists($json_file)) {
        $recruitment_roles_cached_json = file_get_contents($json_file);
    } else {
        $recruitment_roles_cached_json = json_encode([
            'error' => 'File not found: ' . $json_file
        ]);
    }

    return $recruitment_roles_cached_json;
}

function optimize_from_user($request) {
    $params = $request->get_json_params();
    $prompt_text = "";
    $prompt_company_project_format_template_en = <<<EOT
You are a %s. 
I am applying for %s. 
I will provide three part of texts, one is the %s intruction, second is my responsibilities in the %s, third is my achievements in the %s.
Optimize them and emphasize the ability of %s, make it the way you would like.
No format, no added information, just the result of pure text like this: {"instruction" : "xxx", "responsibilities": "xxx", "achievement": "xxx"}.
Intruction:
%s
Responsibilities:
%s
Achievements:
%s
EOT;

    $prompt_summary_format_template_en = <<<EOT
You are a %s. 
I am applying for %s. 
I will provide a summary about my skills, experiences and judgements.
Optimize it and emphasize the ability of %s, make it the way you would like.
No format, no added information, just the result of pure text like this: {"summary" : "xxx"}.
summary:
%s
EOT;

    $type = sanitize_text_field($params['type']);
    $reader_role = sanitize_text_field($params['reader_role']);
    $target_role = sanitize_text_field($params['target_role']);
    $skills = sanitize_text_field($params['skills']);
    $prompt_text = "";
    if ($type === "work_exp" || $type === "proj_exp") {
        $instruction = sanitize_text_field($params['instruction']);
        $responsibilities = sanitize_text_field($params['responsibilities']);
        $achievements = sanitize_text_field($params['achievements']);
        $type_lable = sanitize_text_field($params['type_lable']);//"company" | "project";
            $prompt_text = sprintf($prompt_company_project_format_template_en,
            $reader_role, $target_role, $type_lable, $type_lable, $type_lable,
            $skills, $instruction, $responsibilities, $achievements);
    } elseif ($type === "summary") {
        $summary = sanitize_text_field($params['summary']);
        $prompt_text = sprintf($prompt_summary_format_template_en,
            $reader_role, $target_role, $skills, $summary);
    }

    
    $result = generate_text_from_huggingface($prompt_text);
    $success = true;
    if (isset($result['choices'][0]['message']['content'])) {
        $output = $result['choices'][0]['message']['content'];
        $success = true;
    } else {
        $output = "Failed to generate text.";
        $success = false;
    }

    return new WP_REST_Response([
        'success' => $success,
        'output' => $output
    ], 200);
}


function career_get_roles($request) {
    // 假设你已经定义了 get_roles_json()，它返回 JSON 字符串
    $json_string = get_recruitment_roles_json();
    
    // 解码为 PHP 数组返回（REST API 自动编码成 JSON）
    $roles = json_decode($json_string, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Invalid roles JSON data.'
        ], 500);
    }

    return new WP_REST_Response([
        'success' => true,
        'roles' => $roles
    ], 200);
}
// wp_enqueue_script('career-baist-frontend', plugin_dir_url(__FILE__) . 'assets/main.js', [], null, true);
// wp_add_inline_script('career-baist-frontend', 'window.PLUGIN_BASE_URL = "' . plugin_dir_url(__FILE__) . '";', 'before');


// function custom_login_redirect($redirect_to, $request, $user) {
//     return home_url('/my_career');
// }
// add_filter('login_redirect', 'custom_login_redirect', 10, 3);

// function custom_rewrite_rule() {
//     add_rewrite_rule()
// }
add_action( 'template_redirect', 'custom_redirect_based_on_login_status' );

function custom_redirect_based_on_login_status() {
    // 1. 定义你的React应用页面的slug
    $login_page_slug = 'welcome'; // 承载React登录应用的WordPress页面的slug
    $dashboard_page_slug = 'my_career'; // 承载React主应用的WordPress页面的slug
    $reset_password_page_slug = 'reset-password';

    // 获取这些页面的URL (更健壮的方式)
    $login_page_url = get_permalink( get_page_by_path( $login_page_slug ) );
    $dashboard_page_url = get_permalink( get_page_by_path( $dashboard_page_slug ) );
    $reset_password_page_url = get_permalink( get_page_by_path( $reset_password_page_slug ) );

    // 如果页面不存在，则设置一个默认的回退URL，例如首页
    if ( ! $login_page_url ) $login_page_url = home_url('/');
    if ( ! $dashboard_page_url ) $dashboard_page_url = home_url('/');
    if ( ! $reset_password_page_url ) $reset_password_page_url = home_url('/');


    // 2. 不需要重定向的例外情况
    // (例如管理后台, REST API请求, WordPress自带的登录/注册页面(虽然你不用了但最好保留) )
    if ( is_admin() || defined('DOING_AJAX') || defined('REST_REQUEST') ||
         $GLOBALS['pagenow'] === 'wp-login.php' || $GLOBALS['pagenow'] === 'wp-register.php' ) {
        return;
    }

    // 3. 核心重定向逻辑
    if ( is_user_logged_in() ) {
        // 用户已登录
        // 如果用户已登录，但正试图访问 "登录React页"，则重定向到 "仪表盘React页"
        // 使用 is_page() 判断当前是否为指定的WordPress页面
        if ( is_page( $login_page_slug ) ) {
            wp_redirect( $dashboard_page_url );
            exit;
        }
        // 可选: 如果用户已登录，并且访问的是任何其他非 "仪表盘React页" 的页面，
        // 你也可以考虑是否统一都跳转到 "仪表盘React页"。
        // else if ( !is_page( $dashboard_page_slug ) ) {
        //     wp_redirect( $dashboard_page_url );
        //     exit;
        // }

    } else {
        // 用户未登录
        // 如果用户未登录，并且他们试图访问的不是 "登录React页"
        // (例如，他们直接访问了 "仪表盘React页" 的URL，或其他需要登录的页面)
        // 则重定向到 "登录React页"
        if ( ! is_page( $login_page_slug ) && ! is_page($reset_password_page_slug)) {
            // 这里可以更精确地控制哪些页面需要登录。
            // 例如，只在访问 $dashboard_page_slug 时重定向，或者维护一个受保护页面列表。
            // 如果你的意图是除了登录页之外的所有页面都需要登录：
            wp_redirect( $login_page_url );
            exit;
        }
    }
}
