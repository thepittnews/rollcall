const cheerio = require('cheerio');
const fs = require('fs/promises');
const request = require('request-promise');

const bills = [
  { year: 2021, bill_body: 'S', bill_nbr: 265, sess_yr: 2021, school: 'PSU' },
  { year: 2021, bill_body: 'S', bill_nbr: 266, sess_yr: 2021, school: 'PITT' },
  { year: 2021, bill_body: 'S', bill_nbr: 267, sess_yr: 2021, school: 'TEMPLE' },
  { year: 2021, bill_body: 'S', bill_nbr: 268, sess_yr: 2021, school: 'LINCOLN' },
  { year: 2020, bill_body: 'H', bill_nbr: 2441, sess_yr: 2019, school: 'PSU' },
  { year: 2020, bill_body: 'H', bill_nbr: 2442, sess_yr: 2019, school: 'PITT' },
  { year: 2020, bill_body: 'H', bill_nbr: 2443, sess_yr: 2019, school: 'TEMPLE' },
  { year: 2020, bill_body: 'H', bill_nbr: 2444, sess_yr: 2019, school: 'LINCOLN' },
  { year: 2019, bill_body: 'H', bill_nbr: 1350, sess_yr: 2019, school: 'PSU' },
  { year: 2019, bill_body: 'H', bill_nbr: 1351, sess_yr: 2019, school: 'PITT' },
  { year: 2019, bill_body: 'H', bill_nbr: 1352, sess_yr: 2019, school: 'TEMPLE' },
  { year: 2019, bill_body: 'H', bill_nbr: 1353, sess_yr: 2019, school: 'LINCOLN' },
  { year: 2018, bill_body: 'H', bill_nbr: 2242, sess_yr: 2017, school: 'PSU' },
  { year: 2018, bill_body: 'H', bill_nbr: 2243, sess_yr: 2017, school: 'PITT' },
  { year: 2018, bill_body: 'H', bill_nbr: 2244, sess_yr: 2017, school: 'TEMPLE' },
  { year: 2018, bill_body: 'H', bill_nbr: 2245, sess_yr: 2017, school: 'LINCOLN' },
  { year: 2017, bill_body: 'S', bill_nbr: 326, sess_yr: 2017, school: 'PSU' },
  { year: 2017, bill_body: 'S', bill_nbr: 327, sess_yr: 2017, school: 'PITT' },
  { year: 2017, bill_body: 'S', bill_nbr: 328, sess_yr: 2017, school: 'TEMPLE' },
  { year: 2017, bill_body: 'S', bill_nbr: 329, sess_yr: 2017, school: 'LINCOLN' },
  { year: 2016, bill_body: 'S', bill_nbr: 912, sess_yr: 2015, school: 'PSU' },
  { year: 2016, bill_body: 'S', bill_nbr: 915, sess_yr: 2015, school: 'PITT' },
  { year: 2016, bill_body: 'S', bill_nbr: 914, sess_yr: 2015, school: 'TEMPLE' },
  { year: 2016, bill_body: 'S', bill_nbr: 916, sess_yr: 2015, school: 'LINCOLN' }
];

const chamberVotesUri = 'https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/rc_view_byBill.cfm';

const getChamberVote = (bill,  chamber) => {
  return request({
    uri: chamberVotesUri,
    qs: Object.assign({}, bill, { bill_type: 'B', rc_body: chamber })
  })
    .then((body) => {
      const $ = cheerio.load(body);

      return request(`https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/${$('a#RCLink_0')[0].attribs.href}`)
      .then((body) => {
        const $ = cheerio.load(body);

        const voteRows = $("div#RCVotesSum div[style='float:right;']");

        if (chamber == "H") {
          return Promise.resolve({
            house_y: voteRows[0].children[0].data,
            house_n: voteRows[1].children[0].data,
            house_e: voteRows[2].children[0].data,
            house_nv: voteRows[3].children[0].data
          });
        } else {
          return Promise.resolve({
            senate_y: voteRows[0].children[0].data,
            senate_n: voteRows[1].children[0].data,
            senate_nv: voteRows[2].children[0].data
          });
        }
      });
    });
};

const main = () => {
  Promise.all(bills.map((bill) => {
    return Promise.all([
      getChamberVote(bill, 'H'),
      getChamberVote(bill, 'S')
    ]).then(([ houseVote, senateVote ]) => {
      return Promise.resolve(Object.assign(bill, houseVote, senateVote));
    });
  }))
    .then((billData) => {
      return Promise.resolve(
        billData.sort((a, b) => a.year - b.year)
        .map((bill) => {
        return [
          bill.year, bill.school,
          bill.house_y, bill.house_n, bill.house_e, bill.house_nv,
          bill.senate_y, bill.senate_n, bill.senate_nv
        ].join(',');
      }));
    })
    .then((serializedBillData) => {
      let str = `year,school,house_y,house_n,house_e,house_nv,senate_y,senate_n,senate_nv\n`;
      str += serializedBillData.join("\n");

      return fs.writeFile('bills.csv', str);
    });
};

main();
