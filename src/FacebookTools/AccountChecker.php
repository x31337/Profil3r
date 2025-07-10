<?php

namespace App\FacebookTools;

class AccountChecker
{
    public function checkAccount(string $uid): string
    {
        if (empty($uid)) {
            return "Error: User ID cannot be empty.";
        }

        $url = "https://graph2.facebook.com/v3.3/{$uid}/picture?redirect=0";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // It's good practice to set a timeout for cURL requests
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // 5 seconds connection timeout
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);      // 10 seconds overall timeout

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        if ($curl_error) {
            return "Curl error: " . $curl_error;
        }

        if ($http_code == 200) {
            $d = json_decode($response);
            if ($d && isset($d->data) && isset($d->data->url) && $d->data->url && $d->data->url != 'https://static.xx.fbcdn.net/rsrc.php/v3/yo/r/UlIqmHJn-SK.gif') {
                return "ID is: {$uid} live.";
            } else {
                return "ID is: {$uid} died or picture is default.";
            }
        } else {
            return "Error checking ID {$uid}. HTTP Code: {$http_code}. Response: " . $response;
        }
    }
}
