import moment from "moment-timezone";
function formatMessage(username,text){
    return{
        username,
        text, 
        time: moment().tz('Asia/Kolkata').format('h:mm a')
    }
}

export default formatMessage;
