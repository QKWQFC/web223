import 'package:flutter/material.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';
import 'package:web3_ticket_flatform/login_page.dart';
//import 'package:web3_ticket_flatform/main_page.dart';
import 'package:web3_ticket_flatform/mypage_view.dart';
import 'package:web3_ticket_flatform/data/datas.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  KakaoSdk.init(
    javaScriptAppKey: javaScriptAppKey,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'NEAR Flutter API Example',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/login',
      routes: {
        // When navigating to the "/" route, build the FirstScreen widget.
        '/login': (context) => const MyLoginPage(),
        // When navigating to the "/second" route, build the SecondScreen widget.
        '/mypageview': (context) => const MyPageView(),
      },
    );
  }
}
