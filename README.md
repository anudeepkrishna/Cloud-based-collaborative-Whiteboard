
1.Introduction
   This whiteboard system is the collaborative whiteboard that many users can  draw on a virtual whiteboard at same time.
This white board system update the state of whiteboard in real time so that all users can share whiteboard over network.
This whiteboard system can be used for several purposes such as art, design, teaching and so on.

2.Distributed system design architecture
  This system have exchange protocol that establishes which messages are sent in which situation and the replies that they should generate.
  Users can join to server using socket.io communication to manage traffic and provide fault tolerance.
  This system can be deployed in a cloud environment because this system use socket.io communication and 
  Itself exchange protocol that can be available cloud.

3.Design features
  -Voting the leader
  -Users management by leader
  -Sharing whiteboard between all users
  -Drawing line, rectangle, circle …
  -Save as .png file
  -global chatting

4.Service implementation details
1)Implementation using docker service
   -open cmd prompt
   -cd whiteboard
   -docker build -t whiteboard.
   -docker run -p 3001:3001 -d whiteboard1
   -open localhost:3001 in your browser
   -password:w
2)Implementation without docker service
  -open cmd prompt
  -cd whiteboard
  -npm install --save
  -node index.js
  -open localhost:3001 in your browser
  -password:w

5.Technology choices made
  -Node.js
  -javascript
  -socket.io
  -docker using technology
  -html, css
  -jquery
6.Snapshots
   Whiteboard.png

7.Conclusion
  This whiteboard system include the several functions so that multi users can create and design their idea on collaborative whiteboard platform.




