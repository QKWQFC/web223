import 'dart:core';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:web3_ticket_flatform/data/account.dart';
import 'package:web3_ticket_flatform/data/datas.dart';
import 'package:near_api_flutter/near_api_flutter.dart' as napi;
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';
import 'package:bs58/bs58.dart';

class MyLoginPage extends StatefulWidget {
  const MyLoginPage({super.key});

  @override
  State<MyLoginPage> createState() => _MyLoginPageState();
}

class _MyLoginPageState extends State<MyLoginPage> {
  String userAccount = 'empty';
  String userToken = 'empty';
  String userInfo = 'empty';
  late Map<String, dynamic> user;
  late String userPrivateKeyString;
  late String userPublicKeyString;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () async {
                await kakaoLogin(context);
                napi.PrivateKey userPrivateKey =
                    napi.PrivateKey(base58.decode(userPrivateKeyString));
                napi.PublicKey userPublicKey =
                    napi.PublicKey(userPrivateKey.bytes.sublist(32, 64));

                connectedAccount = napi.Account(
                    accountId: userAccount,
                    keyPair: napi.KeyPair(userPrivateKey, userPublicKey),
                    provider: napi.NEARTestNetRPCProvider());
              },
              style: ElevatedButton.styleFrom(fixedSize: const Size(210, 50)),
              child: const Text('Login with Kakao'),
            ),
            Text("Your Access Token:$userToken"),
            const SizedBox(
              height: 10,
            ),
            Text("Your User Info:$userInfo"),
          ],
        ),
      ),
    );
  }

  Future<void> kakaoLogin(BuildContext context) async {
    late OAuthToken token;
    if (await isKakaoTalkInstalled()) {
      try {
        token = await UserApi.instance.loginWithKakaoTalk();
      } catch (error) {
        print('카카오톡으로 로그인 실패 $error');

        if (error is PlatformException && error.code == 'CANCELED') {
          userInfo = 'Error';
        }
        try {
          token = await UserApi.instance.loginWithKakaoAccount();
        } catch (error) {
          print('카카오계정으로 로그인 실패 $error');
        }
      }
    } else {
      try {
        token = await UserApi.instance.loginWithKakaoAccount();
      } catch (error) {
        print('카카오계정으로 로그인 실패 $error');
      }
    }
    setState(() {
      userToken = token.accessToken;
    });

    // 서버로 access token 전송 및 유저 정보 get
    final url = Uri.parse(serverUrl);
    final response = await http.get(
      url,
      headers: <String, String>{
        "Content-Type": "application/json",
        "x-2to3-accesstoken": userToken,
      },
    );

    if (response.statusCode == 200) {
      user = jsonDecode(response.body);
      userAccount = user['walletAddress'];
      userPrivateKeyString = user['privateKey'];
      userPublicKeyString = user['publicKey']['data'];

      napi.PrivateKey userPrivateKey =
          napi.PrivateKey(base58.decode(userPrivateKeyString));
      napi.PublicKey userPublicKey =
          napi.PublicKey(userPrivateKey.bytes.sublist(32, 64));

      connectedAccount = napi.Account(
          accountId: userAccount,
          keyPair: napi.KeyPair(userPrivateKey, userPublicKey),
          provider: napi.NEARTestNetRPCProvider());

      setState(() {
        isAccountLogined = true;
        userInfo = userAccount;
      });
      if (context.mounted) {
        Navigator.pushNamed(context, '/mypageview');
      }
    } else {
      setState(() {
        userInfo = 'Login Failed!';
      });
    }
  }
}
