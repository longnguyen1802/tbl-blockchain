University
register & login : No need to change
issue process : also dont need to change ( can read to understand ( function postIssueCertificate in file university-controller.js ) )
dashboard: 
    function: getDashBoard in file university-controller.js
        Modify: create the pdf form ( Use the pdf-lib not hard but not in this github ) and put it inside public/assets
                fetch the pdf and add data to it (in here ) to form a pdf data and pass it to dashboard-university.ejs
    In dashboard-university.ejs:
        Modify:
            Add a button to download the pdf ( in here use the data pass above to create pdf and download )
 Verify
    In file verify.ejs
        Modify: Add the button upload file and submit
        When submit using fetch API to send request to server.
    Server in file verify-controller.js
        Modify: Get data from the pdf
        Check if it is correct with the data in the database
        fetch data from database and check if the data is in the blockchain
        ( can skip step check data in database but dont know the error when verify in blockchain ( for example if check with data in database can know that name is incorrect or cga is incorrect)
        
        
