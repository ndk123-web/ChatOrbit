1) When Receiver User is Offline then Sender should see the message that send to Receiver which is Offline 
-> 
    a. Because I Am Using When Both Are Online then And only then i am sending message to both sender and receiver  
    
    b. When Both Online then I am storing the message inside the "Messages" DB 
    
    c. When Either one if Offline then I am Storing the message inside "OfflineMessage" DB    

2. When User Came To Online then Sender or Users cant see whether Receiver or another user came online after re-render it would work for that , 
-> 
    a. I need to Use Either Separate State and For that State need to use useEffect so that it will automatically re-renders the page on state changes

3. We Dont Need "OfflineMessages" DB because 
->
    a. whenever Reciever came Online then all the Messages Will be render from "Messages" DB       