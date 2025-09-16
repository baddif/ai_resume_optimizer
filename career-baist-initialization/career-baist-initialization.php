<?php
/*
Plugin Name: career baist initialization
Description: A plugin to load data from the database on initialization and make it globally readable.
Version: 1.0
Author: Yifu Ding
*/

// 挂钩到WordPress初始化动作
add_action('init', 'cbi_load_data');

function cbi_load_data() {
    global $wpdb, $hugging_face_api_url, $hugging_face_api_token;

    // 从数据库读取数据
    // $table_name = $wpdb->base_prefix . 'ai_api_tokens';
    $data = $wpdb->get_results("SELECT * FROM ai_api_tokens where `from_company` = 'HuggingFace'");

    if (empty($data)) {
        return;
    }
    // 将数据存储为全局变量
    $hugging_face_api_url = $data[0]->api_url;
    $hugging_face_api_token = $data[0]->api_token;
}

// 提供一个函数来获取数据
function cbi_get_hugging_face_api_url() {
    global $hugging_face_api_url;
    return $hugging_face_api_url;
}

function cbi_get_hugging_face_api_token() {
    global $hugging_face_api_token;
    return $hugging_face_api_token;
}
