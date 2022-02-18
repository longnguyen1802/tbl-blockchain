let universities = require('../database/models/universities');
let fabricEnrollment  = require('../services/fabric/enrollment');
let chaincode = require('../services/fabric/chaincode');
let logger = require("../services/logger");
let universityService = require("../services/university-service");
const {
    PDFDocument
} = require("pdf-lib");
const download = require("downloadjs");
const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));
    
let title = "University";
let root = "university";


async function postRegisterUniversity(req, res, next) {
    try {
        let keys = await fabricEnrollment.registerUser(req.body.email);
        let location = req.body.location + `, ${req.body.country}`;

        let dbResponse = await universities.create({
            name : req.body.name,
            email: req.body.email,
            description: req.body.description,
            location: location,
            password: req.body.password,
            publicKey: keys.publicKey
        });

        let result = await chaincode.invokeChaincode("registerUniversity",
            [ req.body.name, keys.publicKey, location, req.body.description], false, req.body.email);
        logger.debug(`University Registered. Ledger profile: ${result}`);

        res.render("register-success", { title, root,
            logInType: req.session.user_type || "none"});
    }
    catch (e) {
        logger.error(e);
        next(e);
    }
}

async function postLoginUniversity (req,res,next) {
    try {
        let universityObject = await universities.validateByCredentials(req.body.email, req.body.password)
        req.session.user_id = universityObject._id;
        req.session.user_type = "university";
        req.session.email = universityObject.email;
        req.session.name = universityObject.name;

        return res.redirect("/university/issue")
    } catch (e) {
        logger.error(e);
        next(e);
    }
}

async function logOutAndRedirect (req, res, next) {
    req.session.destroy(function () {
        res.redirect('/');
    });
}

async function postIssueCertificate(req,res,next) {
    try {
        let certData = {
            studentEmail: req.body.studentEmail,
            studentName: req.body.studentName,
            universityName: req.session.name,
            universityEmail: req.session.email,
            major: req.body.major,
            departmentName:  req.body.department,
            cgpa: req.body.cgpa,
            dateOfIssuing: req.body.date,
        };
        
        let serviceResponse = await universityService.issueCertificate(certData);

        if(serviceResponse) {
            res.render("issue-success", { title, root,
                logInType: req.session.user_type || "none"});
        }

    } catch (e) {
        logger.error(e);
        next(e);
    }
}

async function getDashboard(req, res, next) {
    try {
        let certData = await universityService.getCertificateDataforDashboard(req.session.name, req.session.email);
        // add here
        let datas = []
        // Fetch the PDF with form fields
        console.log(`${req.protocol}://${req.get('host')}`)
        //const formUrl = 'http://172.22.221.237:8000/formtesttest.pdf'
        const formUrl = `${req.protocol}://${req.get('host')}/assets/formtesttest.pdf`
        const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())


        // Load a PDF with form fields
        for(var i=0;i<certData.length;i++)
        {
        const pdfDoc = await PDFDocument.load(formPdfBytes)


        // Get the form containing all the fields
        const form = pdfDoc.getForm()

        // Get all fields in the PDF by their names
        const name = form.getTextField('Name')
        const school = form.getTextField("School")
        const date = form.getTextField("Date")
        const location = form.getTextField("Location")
        const cga = form.getTextField("CGA")
        const email = form.getTextField("Email")
        const UUID = form.getTextField("UUID")
        name.setText(certData[i].studentName)
        school.setText(certData[i].departmentName)
        date.setText(certData[i].dateOfIssuing)
        location.setText(certData[i].major)
        cga.setText(certData[i].cgpa)
        email.setText(certData[i].studentEmail)
        UUID.setText(certData[i].certUUID)


        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()
        // console.log("data is", pdfBytes);
        datas.push(pdfBytes);
        // Trigger the browser to download the PDF document
        // end here
        }
        res.render("dashboard-university", { title, root, certData,
            logInType: req.session.user_type || "none",datas});

    } catch (e) {
        logger.error(e);
        next(e);
    }
}
module.exports = {postRegisterUniversity, postLoginUniversity, logOutAndRedirect, postIssueCertificate, getDashboard};