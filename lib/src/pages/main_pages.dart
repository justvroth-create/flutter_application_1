import 'package:flutter/material.dart';

class MainPages extends StatefulWidget {
  const new({super.key});

  @override
  State<MainPages> createState() => _MainPagesState();
}

class _MainPagesState extends State<MainPages> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
      backgroundColor: Colors.green,
      title: Text("Main Pages"),
      ),
      body: Container(
        color: Colors.grey,
        child: Image.network("https://www.remodelai.io/blog/homestyler-alternatives/hero.jpg")
      ),
    );
  }
}

