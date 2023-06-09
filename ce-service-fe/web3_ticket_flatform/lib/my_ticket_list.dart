import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:web3_ticket_flatform/widget/ticket.dart';

import 'package:web3_ticket_flatform/data/account.dart';

class MyTicketList extends StatefulWidget {
  const MyTicketList({super.key});

  @override
  State<MyTicketList> createState() => _MyTicketListState();
}

class _MyTicketListState extends State<MyTicketList> {
  late final List<dynamic> ticketList;

  @override
  Widget build(BuildContext context) {
    if (ticketString != "") {
      ticketList = json.decode(ticketString);
      return SizedBox(
        height: 600,
        child: ListView.builder(
          itemCount: ticketList.length,
          itemBuilder: (BuildContext context, int index) {
            return MyTicket(
              owner: ticketList[index]['owner_id'],
              tokenId: ticketList[index]['token_id'],
              icon: Icons.airplanemode_active,
              nearAmount: 123,
            );
          },
        ),
      );
    } else {
      return SizedBox(
        height: 500,
        child: Text('nothing!$ticketString'),
      );
    }
  }
}
