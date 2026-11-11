import 'package:flutter/material.dart';

class LayoutColumnPage extends StatefulWidget {
  const LayoutColumnPage({super.key});

  @override
  State<LayoutColumnPage> createState() => _LayoutColumnPageState();
}

class _LayoutColumnPageState extends State<LayoutColumnPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.red,
                      alignment: Alignment.center,
                      child: const Text("1")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.yellow,
                      alignment: Alignment.center,
                      child: const Text("2")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.cyan,
                      alignment: Alignment.center,
                      child: const Text("3")),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Container(
                      height: 80,
                      width: 80,
                      color: const Color.fromARGB(255, 255, 190, 86),
                      alignment: Alignment.center,
                      child: const Text("4")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.blue,
                      alignment: Alignment.center,
                      child: const Text("5")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.green,
                      alignment: Alignment.center,
                      child: const Text("6")),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.red,
                      alignment: Alignment.center,
                      child: const Text("7")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.teal,
                      alignment: Alignment.center,
                      child: const Text("8")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.blue,
                      alignment: Alignment.center,
                      child: const Text("9")),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Container(
                      height: 80,
                      width: 80,
                      color: const Color.fromARGB(255, 255, 218, 106),
                      alignment: Alignment.center,
                      child: const Text("10")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.pink,
                      alignment: Alignment.center,
                      child: const Text("11")),
                  Container(
                      height: 80,
                      width: 80,
                      color: Colors.red,
                      alignment: Alignment.center,
                      child: const Text("12")),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
