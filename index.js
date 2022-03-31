const cheerio = require('cheerio');
const request = require('request-promise');

const bills = {
  '2021': [
    { bill_body: 'S', bill_nbr: 265, school: 'PSU' },
    { bill_body: 'S', bill_nbr: 266, school: 'PITT' },
    { bill_body: 'S', bill_nbr: 267, school: 'TEMPLE' },
    { bill_body: 'S', bill_nbr: 268, school: 'LINCOLN' }
  ]
};

const chamberVotesUri = 'https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/rc_view_byBill.cfm';

const getChamberVote = (bill, billYear, chamber) => {
  return request({
    uri: chamberVotesUri,
    qs: Object.assign({}, bill, { bill_type: 'B', rc_body: chamber, sess_yr: billYear })
  })
    .then((body) => {
      const $ = cheerio.load(body);

      return request(`https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/${$('a#RCLink_0')[0].attribs.href}`)
      .then((body) => {
        const $ = cheerio.load(body);

        const voteRows = $("div#RCVotesSum div[style='float:right;']");

        if (chamber == "H") {
          const y = voteRows[0].children[0].data;
          const n =voteRows[1].children[0].data;
          const e = voteRows[2].children[0].data;
          const nv = voteRows[3].children[0].data;

          return Promise.resolve({ chamber, y, n, e, nv });
        } else {
          const y = voteRows[0].children[0].data;
          const n =voteRows[1].children[0].data;
          const nv = voteRows[2].children[0].data;

          return Promise.resolve({ chamber, y, n, nv });
        }
      });
    });
};

const main = () => {
  Promise.all(Object.keys(bills).map((billYear) => {
    return Promise.all(bills[billYear].map((bill) => {
      return Promise.all([
        getChamberVote(bill, billYear, 'H'),
        getChamberVote(bill, billYear, 'S')
      ]).then((votes) => {
        return Promise.resolve(Object.assign(bill, { votes, year: billYear }));
      });
    }));
  }))
    .then((b) => console.log(b));
};

main();
