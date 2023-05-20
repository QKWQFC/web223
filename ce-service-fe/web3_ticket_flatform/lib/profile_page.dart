import 'package:flutter/material.dart';
import 'package:web3_ticket_flatform/near_tester.dart';
import 'package:web3_ticket_flatform/data/datas.dart';
import 'package:near_api_flutter/near_api_flutter.dart';

import 'package:web3_ticket_flatform/data/account.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: SingleChildScrollView(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 200),
                Text("Hello, $userAccount",
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    )),
                const SizedBox(height: 90),
                ElevatedButton(
                  //call with deposit
                  onPressed: () async {
                    setState(() {
                      mintResponse = {};
                    });
                    String method = mintMethod;
                    String methodArgs =
                        '{"token_id": "token-994", "metadata": {"title": "My Non Fungible Team Token", "description": "The Team Most Certainly Goes :)", "media": "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif"}, "receiver_id": "${connectedAccount.accountId}"}';
                    Contract contract = Contract(contractId, connectedAccount);

                    mintResponse =
                        await NEARTester.callMethodLimitedAccessWithDeposit(
                            contract,
                            method,
                            walletURL,
                            methodArgs,
                            1.0,
                            nearSignInSuccessUrl,
                            nearSignInFailUrl,
                            walletApproveTransactionUrl);
                    setState(() {});
                  },
                  child: Text("Call with ${"1".toString()} Near deposit"),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
