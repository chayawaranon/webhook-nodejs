const express = require('express');
const app = express();
const diff = require('dialogflow-fulfillment');
const { response } = require('express');
const axios = require('axios');

Date.prototype.getWeek = function(x) {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return `${this.getFullYear()}-${Math.ceil((((x - onejan) / 86400000) + onejan.getDay()+1)/7)}`;
};

app.get('/', (req, res) => {
    res.send("we are live")
});

app.post('/',express.json() ,(req,res) =>{
    const agent = new diff.WebhookClient({
        request: req,
        response: res
    });

    function bodyMassIndex(agent) {
        let weight = req.body.queryResult.parameters.weight;
        let height = req.body.queryResult.parameters.height / 100;
        console.log('w = ' + weight);
        console.log('h = ' + height);
        let bmi = (weight / (height * height)).toFixed(2);
        let result = 'ขออภัย ไม่เข้าใจค่ะ';
    
        if (bmi < 18.5) {
            result = 'ผอมเกินไปนะ กินข้าวเยอะ ๆ';
        } else if (bmi >= 18.5 && bmi <= 22.9) {
            result = 'หุ่นดีจังเลยค่ะ';
        } else if (bmi >= 23 && bmi <= 24.9) {
            result = 'เริ่มท้วมแล้วนะคะ';
        } else if (bmi >= 25 && bmi <= 29.9) {
            result = 'อ้วนละน้าา';
        } else if (bmi > 30) {
            result = 'อ้วนเกินไปแล้วว ออกกำลังกายเยอะ ๆ นะจ๊ะ';
        }
            agent.add(result);
    }

    function searchSong(agent) {
        let song_name = req.body.queryResult.parameters.song_name;
        let get_date = agent.parameters.get_date;
        let temp = new Date;
        //console.log(get_date);
        let day = new Date(`${temp.getFullYear()}-${get_date}`);  
        let result = null;
        let count = 0;
        //console.log('weekyear = ' + weekNumber);

        return axios.get(`https://sheetdb.io/api/v1/swyrcvta772ks?sheet=${day.getWeek(day)}`)
          .then( response => {
            response.data.forEach(el => {
                count++;
                if(el.song_list.toLowerCase() == song_name.toLowerCase()) {
                    result = `เพลง "${el.song_list}" อยู่อันดับ ${count} ในวันที่ ${temp.getFullYear()}-${get_date} ค่ะ`;
                }
            });

            if(!result) {
                result = `ไม่พบเพลง "${song_name}" บน Chart ในวันที่ ${temp.getFullYear()}-${get_date} ค่ะ`;
            }

            agent.add(result);
        })
        .catch(err => {
            agent.add("มีอะไรบางอย่างผิดพลาด กรุณาลองอีกครั้งค่ะ");
        });
    }

    let intentMap = new Map();
    intentMap.set('BMI - ask weight and height - yes', bodyMassIndex);
    intentMap.set('search song - add date', searchSong);

    agent.handleRequest(intentMap);
});

app.listen(3333, ()=> console.log("Live port 3333"));