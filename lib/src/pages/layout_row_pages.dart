import 'package:flutter/material.dart';

class LayoutRowPages extends StatefulWidget {
  const LayoutRowPages({super.key});

  @override
  State<LayoutRowPages> createState() => _LayoutRowPagesState();
}

class _LayoutRowPagesState extends State<LayoutRowPages> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        height: 1000,
        width: double.infinity,
        color: Colors.grey,
        child: Row(
          mainAxisAlignment:MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              color: Colors.red,
              
            ),
            // Icon(
            //   Icons.favorite,
            //   color: const Color.fromARGB(255, 255, 0, 64),
            //   size: 70,
            // ),
            // Icon(
            //   Icons.favorite,
            //   color: const Color.fromARGB(255, 255, 0, 179),
            //   size: 70,
            // ),
            // Icon(
            //   Icons.favorite,
            //   color: const Color.fromARGB(255, 255, 59, 118),
            //   size: 70,
            // ),
          ],
          
        ),
      ),
    );
  }
}
