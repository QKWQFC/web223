import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:near_api_flutter/near_api_flutter.dart';
import 'package:web3_ticket_flatform/near_tester.dart';
import 'package:web3_ticket_flatform/login_page.dart';
import 'package:web3_ticket_flatform/data/datas.dart';
import 'package:web3_ticket_flatform/data/account.dart';
import 'package:web3_ticket_flatform/my_ticket_list.dart';

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  Map response = {};
  final _textUserIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _textUserIdController.text = userAccount;
  }

  @override
  Widget build(BuildContext context) {
    if (isAccountLogined) {
      getMyTicketList();
      return Scaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(
                  height: 20,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Icon(Icons.menu, size: 40, color: Colors.black),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text("Hey, min49590",
                            style: TextStyle(
                              color: Colors.black,
                              fontSize: 30,
                              fontWeight: FontWeight.w800,
                            )),
                        Text(
                          "Welcome back!",
                          style: TextStyle(
                            color: Colors.black.withOpacity(0.7),
                            fontSize: 18,
                          ),
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(
                  height: 40,
                ),
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text(
                    "Contract: $contractId",
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    buildUserId(),
                    buildLimitedAccessCard(),
                    listUpTickets(),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    } else {
      return const MyLoginPage();
    }
  }

  //Limited Access
  buildLimitedAccessCard() {
    return Card(
      child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 50),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: ElevatedButton(
                  //call with deposit
                  onPressed: () async {
                    setState(() {
                      response = {};
                    });

                    String method = mintMethod;
                    String methodArgs =
                        '{"token_id": "token-997", "metadata": {"title": "My Non Fungible Team Token", "description": "The Team Most Certainly Goes :)", "media": "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif"}, "receiver_id": "${connectedAccount.accountId}"}';

                    Contract contract = Contract(contractId, connectedAccount);

                    response =
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
                  child: Text("NFT Mint! with ${"1".toString()} Near deposit"),
                ),
              ),
            ],
          )),
    );
  }

  buildUserId() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'User Id to connect with: $userAccount',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  getMyTicketList() async {
    String method = viewMethod;
    String methodArgs =
        '{"account_id": "${connectedAccount.accountId}", "limit": 5}';

    Contract contract = Contract(contractId, connectedAccount);
    response = await NEARTester.callViewMethod(contract, method, methodArgs);
    setState(() {});
  }

  listUpTickets() {
    if (response.isNotEmpty &&
        response.containsKey('result') &&
        response['result'].containsKey('result')) {
      String resultDecoded =
          utf8.decode(response['result']['result'].cast<int>());
      return Card(
          child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 5),
              child: MyTicketList(ticketListString: resultDecoded)));
    } else {
      return const Center(
        child: Text("Your Ticket is Nothing!"),
      );
    }
  }
}
