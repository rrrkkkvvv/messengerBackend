<?php

require '../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = "secret_key_of_server"; 


class Token {
    
    static private $secret_key = "secret_key_of_server"; 

    static function createToken($userId) {

        $payload = [
            'iat' => time(),
            'exp' => time() + 3600,
            'data' => [
                'id' => $userId,
            ]
        ];
        return JWT::encode($payload, self::$secret_key, 'HS256');

    }

    static function verifyToken($jwt) {
        try {
            $decoded = JWT::decode($jwt, new Key(self::$secret_key, 'HS256'));
            return (array) $decoded->data;
        } catch (Exception $e) {
            return null;
        }
    }

}
$token = new Token();