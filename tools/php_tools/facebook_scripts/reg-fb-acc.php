<?php
set_time_limit(0);

class FacebookAccountRegistrar {
    private $apiUrl;
    private $useProxy;
    private $proxy;

    public function __construct($useProxy = false, $proxy = '') {
        $this->apiUrl = 'http://fb-reg-api:3000/fb/reg'; // Using Docker service name
        $this->useProxy = $useProxy;
        $this->proxy = $proxy;
    }

    public function generateRandomName() {
        $firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Emma', 'Olivia', 'Ava', 'Sophia'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez'];
        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    public function generateRandomEmail($name) {
        $domains = ['outlook.com', 'gmail.com', 'yahoo.com', 'protonmail.com'];
        $cleanName = strtolower(str_replace(' ', '', $name));
        return $cleanName . rand(100, 999) . '@' . $domains[array_rand($domains)];
    }

    public function generateRandomPassword() {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        return substr(str_shuffle($chars), 0, 12);
    }

    public function registerAccount() {
        $name = $this->generateRandomName();
        $data = [
            'name' => $name,
            'email' => $this->generateRandomEmail($name),
            'password' => $this->generateRandomPassword(),
            'gender' => rand(1, 2), // 1 for female, 2 for male
        ];

        if ($this->useProxy) {
            $data['proxy'] = $this->proxy;
        }

        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        if ($this->useProxy && !empty($this->proxy)) {
            curl_setopt($ch, CURLOPT_PROXY, $this->proxy);
        }

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => 'cURL error: ' . curl_error($ch)];
        }

        curl_close($ch);
        return json_decode($response, true);
    }
}

// Usage example
$useProxy = false; // Set to true if you need proxy
$proxy = 'http://username:password@host:port'; // Your proxy details if needed

$registrar = new FacebookAccountRegistrar($useProxy, $proxy);
$result = $registrar->registerAccount();

echo "<pre>";
print_r($result);
echo "</pre>";
?>
