<?php

namespace App\FacebookTools;

class PageCreator
{
    public function createPage(string $token, string $fullName): string
    {
        if (empty($token) || empty($fullName)) {
            return "Error: Access Token and Page Full Name cannot be empty.";
        }

        // Sanitize full_name for use in JSON (basic sanitization)
        $safeFullName = addslashes($fullName);

        $postFields = [
            'method' => 'post',
            'pretty' => 'false',
            'format' => 'json',
            'server_timestamps' => 'true',
            'locale' => 'en_US',
            'purpose' => 'fetch',
            'fb_api_req_friendly_name' => 'FbBloksActionRootQuery-com.bloks.www.additional.profile.plus.creation.action.category.submit',
            'fb_api_caller_class' => 'graphservice',
            'client_doc_id' => '11994080423068421059028841356',
            'variables' => '{"params":{"params":"{\\"params\\":\\"{\\\\\\"client_input_params\\\\\\":{\\\\\\"cp_upsell_declined\\\\\\":0,\\\\\\"category_ids\\\\\\":[\\\\\\"2214\\\\\\"],\\\\\\"profile_plus_id\\\\\\":\\\\\\"0\\\\\\",\\\\\\"page_id\\\\\\":\\\\\\"0\\\\\\"},\\\\\\"server_params\\\\\\":{\\\\\\"INTERNAL__latency_qpl_instance_id\\\\\\":40168896100127,\\\\\\"screen\\\\\\":\\\\\\"category\\\\\\",\\\\\\"referrer\\\\\\":\\\\\\"pages_tab_launch_point\\\\\\",\\\\\\"name\\\\\\":\\\\\\"'.$safeFullName.'\\\\\\",\\\\\\"creation_source\\\\\\":\\\\\\"android\\\\\\",\\\\\\"INTERNAL__latency_qpl_marker_id\\\\\\":36707139,\\\\\\"variant\\\\\\":5}}\\"}","bloks_versioning_id":"c3cc18230235472b54176a5922f9b91d291342c3a276e2644dbdb9760b96deec","app_id":"com.bloks.www.additional.profile.plus.creation.action.category.submit"},"scale":"1.5","nt_context":{"styles_id":"e6c6f61b7a86cdf3fa2eaaffa982fbd1","using_white_navbar":true,"pixel_ratio":1.5,"is_push_on":true,"bloks_version":"c3cc18230235472b54176a5922f9b91d291342c3a276e2644dbdb9760b96deec"}}',
            'fb_api_analytics_tags' => '["GraphServices"]',
            'client_trace_id' => 'da784ac0-b476-4316-9335-34672eddf94b' // This might need to be dynamic/random
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_ENCODING, "");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); // Note: consider security implications
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE); // Note: consider security implications
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Increased timeout for potentially longer operations
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        // The original script used CURLOPT_COOKIEJAR, "" and CURLOPT_COOKIEFILE, "".
        // This implies session cookies might be needed for some advanced scenarios,
        // but for a single API call, it might not be strictly necessary.
        // If issues arise, managing cookies might be required. For now, omitting.
        // curl_setopt($ch, CURLOPT_COOKIEJAR, "");
        // curl_setopt($ch, CURLOPT_COOKIEFILE, "");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'x-fb-request-analytics-tags: {"network_tags":{"product":"350685531728","purpose":"fetch","request_category":"graphql","retry_attempt":"0"},"application_tags":"graphservice"}',
            'x-fb-ta-logging-ids: graphql:da784ac0-b476-4316-9335-34672eddf94c', // This trace ID might also need to be dynamic
            'x-fb-rmd: state=URL_ELIGIBLE',
            'x-fb-sim-hni: 31016', // These HNI values might be specific; using generic ones or making them configurable might be better
            'x-fb-net-hni: 31016',
            'authorization: OAuth '.$token,
            'x-graphql-request-purpose: fetch',
            'user-agent: [FBAN/FB4A;FBAV/417.0.0.33.65;FBBV/480086274;FBDM/{density=1.5,width=720,height=1244};FBLC/en_US;FBRV/0;FBCR/T-Mobile;FBMF/samsung;FBBD/samsung;FBPN/com.facebook.katana;FBDV/SM-N976N;FBSV/7.1.2;FBOP/1;FBCA/x86:armeabi-v7a;]', // This is a very specific user agent
            'content-type: application/x-www-form-urlencoded',
            'x-fb-connection-type: WIFI',
            'x-fb-background-state: 1',
            'x-fb-friendly-name: FbBloksActionRootQuery-com.bloks.www.additional.profile.plus.creation.action.category.submit',
            'x-graphql-client-library: graphservice',
            'x-fb-privacy-context: 3643298472347298', // This context ID might be session-specific or profile-specific
            'content-encoding: ',
            'x-fb-device-group: 3543',
            'x-tigon-is-retry: False',
            'priority: u=3,i',
            'accept-encoding: ', // Letting cURL handle this is often better
            'x-fb-http-engine: Liger',
            'x-fb-client-ip: True',
            'x-fb-server-cluster: True'
        ]);

        curl_setopt ($ch, CURLOPT_POST, TRUE);
        curl_setopt ($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
        curl_setopt ($ch, CURLOPT_URL, "https://graph.facebook.com/graphql");

        $responseBody = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (false === $responseBody) {
            if ($curlError) {
                return 'Curl error: ' . $curlError;
            }
            return "Error: cURL execution failed without specific error message. HTTP Code: " . $httpCode;
        }

        $decodedResponse = json_decode($responseBody);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return "Error decoding JSON response: " . json_last_error_msg() . ". Response body: " . $responseBody;
        }

        // Navigating the complex response structure
        $successRes = $decodedResponse->data->fb_bloks_action->root_action->action->action_bundle->bloks_bundle_action ?? null;

        if ($successRes) {
            if (strpos($successRes, 'Cannot create Page: You have created too many Pages in a short time. Please try later.') !== false) {
                return "Failed to create page: ".$successRes;
            } else {
                // The original script just said "Page created successfully!"
                // The actual response might contain more details, like the page ID.
                // For now, keeping it simple. A more robust solution would parse $successRes for actual success indicators.
                return "Page creation request processed. Response: " . $successRes;
            }
        } else {
            // Attempt to provide more detail if the expected path in JSON is not found
            $errorAction = $decodedResponse->data->fb_bloks_action->error_action->message_text ?? 'Unknown error structure in response.';
            return "Page creation failed or response structure unrecognized. HTTP Code: {$httpCode}. Error action message: {$errorAction}. Full response: " . $responseBody;
        }
    }
}
