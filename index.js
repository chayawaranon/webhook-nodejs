const express = require('express');
const app = express();
const diff = require('dialogflow-fulfillment');
const { response } = require('express');
const axios = require('axios');

Date.prototype.getWeek = function(x) {
    var onejan = new Date(2020, 0, 1);
    return `${this.getFullYear()}-${Math.ceil((((x - onejan) / 86400000))/7)}`;
};

app.get('/', (req, res) => {
    res.send("we are live")
});

app.post('/',express.json() ,(req,res) =>{
    const agent = new diff.WebhookClient({
        request: req,
        response: res
    });

    function topList(agent) {
        let get_number_list = req.body.queryResult.parameters.get_number_list;
        let get_date = agent.parameters.get_date;
        let temp = new Date;
        let day = new Date(`2020-${get_date}`);  
        let result =  [];
        //console.log(day.getWeek(day));
        return axios.get(`https://sheetdb.io/api/v1/swyrcvta772ks?sheet=${day.getWeek(day)}`)
          .then( response => {
            result.push(`Top ${get_number_list} Billboard Hot 100 ประจำวันที่ ${temp.getFullYear()}-${get_date}`);

            if(get_number_list > 100 || get_number_list < 1) {
                agent.add("กรุณาใส่จำนวนเพลงระหว่าง 1 - 100 ค่ะ");
            }
            else {
                for(let i = 0 ; i < get_number_list ; i++) {
                    result.push(`${i+1}. เพลง: ${response.data[i].song_list}\nศิลปิน: ${response.data[i].artist}`);
                }
                agent.add(result.join("\n\n"));
            }
        })
        .catch(err => {
            agent.add("มีอะไรบางอย่างผิดพลาด กรุณาลองอีกครั้งค่ะ");
            //agent.add(err);
        });
    }

    function searchSong(agent) {
        let song_name = req.body.queryResult.parameters.song_name;
        let get_date = agent.parameters.get_date;
        let temp = new Date;
        //console.log(get_date);
        let day = new Date(`2020-${get_date}`);  
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
    intentMap.set('search song - add date', searchSong);
    intentMap.set('top 10 song - date', topList);

    agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 3333, ()=> console.log("Live port 3333"));