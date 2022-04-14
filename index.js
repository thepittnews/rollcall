const cheerio = require('cheerio');
const request = require('request-promise');
const { writeFile } = require('fs/promises');

const bills = [
  { year: 'June 2021', bill_body: 'S', bill_nbr: 265, sess_yr: 2021, school: 'PSU' },
  { year: 'June 2021', bill_body: 'S', bill_nbr: 266, sess_yr: 2021, school: 'PITT' },
  { year: 'June 2021', bill_body: 'S', bill_nbr: 267, sess_yr: 2021, school: 'TEMPLE' },
  { year: 'June 2021', bill_body: 'S', bill_nbr: 268, sess_yr: 2021, school: 'LINCOLN' },

  { year: 'May 2020', bill_body: 'H', bill_nbr: 2441, sess_yr: 2019, school: 'PSU' },
  { year: 'May 2020', bill_body: 'H', bill_nbr: 2442, sess_yr: 2019, school: 'PITT' },
  { year: 'May 2020', bill_body: 'H', bill_nbr: 2443, sess_yr: 2019, school: 'TEMPLE' },
  { year: 'May 2020', bill_body: 'H', bill_nbr: 2444, sess_yr: 2019, school: 'LINCOLN' },

  { year: 'June 2019', bill_body: 'H', bill_nbr: 1350, sess_yr: 2019, school: 'PSU' },
  { year: 'June 2019', bill_body: 'H', bill_nbr: 1351, sess_yr: 2019, school: 'PITT' },
  { year: 'June 2019', bill_body: 'H', bill_nbr: 1352, sess_yr: 2019, school: 'TEMPLE' },
  { year: 'June 2019', bill_body: 'H', bill_nbr: 1353, sess_yr: 2019, school: 'LINCOLN' },

  { year: 'June 2018', bill_body: 'H', bill_nbr: 2242, sess_yr: 2017, school: 'PSU' },
  { year: 'June 2018', bill_body: 'H', bill_nbr: 2243, sess_yr: 2017, school: 'PITT' },
  { year: 'June 2018', bill_body: 'H', bill_nbr: 2244, sess_yr: 2017, school: 'TEMPLE' },
  { year: 'June 2018', bill_body: 'H', bill_nbr: 2245, sess_yr: 2017, school: 'LINCOLN' },

  { year: 'October 2017', bill_body: 'S', bill_nbr: 326, sess_yr: 2017, school: 'PSU' },
  { year: 'October 2017', bill_body: 'S', bill_nbr: 327, sess_yr: 2017, school: 'PITT' },
  { year: 'October 2017', bill_body: 'S', bill_nbr: 328, sess_yr: 2017, school: 'TEMPLE' },
  { year: 'October 2017', bill_body: 'S', bill_nbr: 329, sess_yr: 2017, school: 'LINCOLN' },

  { year: 'July 2016', bill_body: 'H', bill_nbr: 2137, sess_yr: 2015, school: 'PSU' },
  { year: 'July 2016', bill_body: 'H', bill_nbr: 2138, sess_yr: 2015, school: 'PITT' },
  { year: 'July 2016', bill_body: 'H', bill_nbr: 2139, sess_yr: 2015, school: 'TEMPLE' },
  { year: 'July 2016', bill_body: 'H', bill_nbr: 2140, sess_yr: 2015, school: 'LINCOLN' },

  { year: 'March 2016', bill_body: 'S', bill_nbr: 912, sess_yr: 2015, school: 'PSU' }, // Late 2015
  { year: 'March 2016', bill_body: 'S', bill_nbr: 915, sess_yr: 2015, school: 'PITT' },
  { year: 'March 2016', bill_body: 'S', bill_nbr: 914, sess_yr: 2015, school: 'TEMPLE' },
  { year: 'March 2016', bill_body: 'S', bill_nbr: 916, sess_yr: 2015, school: 'LINCOLN' },

  { year: 'June 2014', bill_body: 'H', bill_nbr: 2334, sess_yr: 2013, school: 'PSU' },
  { year: 'June 2014', bill_body: 'H', bill_nbr: 2335, sess_yr: 2013, school: 'PITT' },
  { year: 'June 2014', bill_body: 'H', bill_nbr: 2336, sess_yr: 2013, school: 'TEMPLE' },
  { year: 'June 2014', bill_body: 'H', bill_nbr: 2337, sess_yr: 2013, school: 'LINCOLN' },

  { year: 'July 2013', bill_body: 'S', bill_nbr: 725, sess_yr: 2013, school: 'PSU' },
  { year: 'July 2013', bill_body: 'S', bill_nbr: 726, sess_yr: 2013, school: 'PITT' },
  { year: 'July 2013', bill_body: 'S', bill_nbr: 727, sess_yr: 2013, school: 'TEMPLE' },
  { year: 'July 2013', bill_body: 'S', bill_nbr: 728, sess_yr: 2013, school: 'LINCOLN' },

  { year: 'June 2012', bill_body: 'S', bill_nbr: 1122, sess_yr: 2011, school: 'PSU' },
  { year: 'June 2012', bill_body: 'S', bill_nbr: 1123, sess_yr: 2011, school: 'PITT' },
  { year: 'June 2012', bill_body: 'S', bill_nbr: 1124, sess_yr: 2011, school: 'TEMPLE' },
  { year: 'June 2012', bill_body: 'S', bill_nbr: 1125, sess_yr: 2011, school: 'LINCOLN' },

  { year: 'June 2011', bill_body: 'H', bill_nbr: 1731, sess_yr: 2011, school: 'PSU' },
  { year: 'June 2011', bill_body: 'H', bill_nbr: 1727, sess_yr: 2011, school: 'PITT' },
  { year: 'June 2011', bill_body: 'H', bill_nbr: 1728, sess_yr: 2011, school: 'TEMPLE' },
  { year: 'June 2011', bill_body: 'H', bill_nbr: 1730, sess_yr: 2011, school: 'LINCOLN' },

  { year: 'March 2010', bill_body: 'H', bill_nbr: 2292, sess_yr: 2009, school: 'PSU' },
  { year: 'March 2010', bill_body: 'H', bill_nbr: 2293, sess_yr: 2009, school: 'PITT' },
  { year: 'March 2010', bill_body: 'H', bill_nbr: 2294, sess_yr: 2009, school: 'TEMPLE' },
  { year: 'March 2010', bill_body: 'H', bill_nbr: 2295, sess_yr: 2009, school: 'LINCOLN' },

  { year: 'December 2009', bill_body: 'S', bill_nbr: 1040, sess_yr: 2009, school: 'PSU' },
  { year: 'December 2009', bill_body: 'S', bill_nbr: 1036, sess_yr: 2009, school: 'PITT' },
  { year: 'December 2009', bill_body: 'S', bill_nbr: 1037, sess_yr: 2009, school: 'TEMPLE' },
  { year: 'December 2009', bill_body: 'S', bill_nbr: 1038, sess_yr: 2009, school: 'LINCOLN' },

  { year: 'July 2008', bill_body: 'H', bill_nbr: 2313, sess_yr: 2007, school: 'PSU' },
  { year: 'July 2008', bill_body: 'H', bill_nbr: 2315, sess_yr: 2007, school: 'PITT' },
  { year: 'July 2008', bill_body: 'H', bill_nbr: 2317, sess_yr: 2007, school: 'TEMPLE' },
  { year: 'July 2008', bill_body: 'H', bill_nbr: 2320, sess_yr: 2007, school: 'LINCOLN' },

  { year: 'July 2007', bill_body: 'S', bill_nbr: 929, sess_yr: 2007, school: 'PSU' },
  { year: 'July 2007', bill_body: 'S', bill_nbr: 930, sess_yr: 2007, school: 'PITT' },
  { year: 'July 2007', bill_body: 'S', bill_nbr: 931, sess_yr: 2007, school: 'TEMPLE' },
  { year: 'July 2007', bill_body: 'S', bill_nbr: 932, sess_yr: 2007, school: 'LINCOLN' },
];

const keysToRemove = ['bill_body', 'bill_nbr', 'school', 'sess_yr', 'year'];

const getChamberVote = (bill, chamber) => {
  return request({
    uri: 'https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/rc_view_byBill.cfm',
    qs: { ...bill, ...{ bill_type: 'B', rc_body: chamber } }
  })
    .then((body) => {
      const $ = cheerio.load(body);
      const latestVoteTitle = $('a#RCLink_0')[0].children[0].data.toLowerCase();
      const voteUrl = latestVoteTitle.includes('mot ') ? $('a#RCLink_1')[0].attribs.href : $('a#RCLink_0')[0].attribs.href;

      return request(`https://www.legis.state.pa.us/CFDOCS/Legis/RC/Public/${voteUrl}`)
      .then((body) => {
        const $ = cheerio.load(body);
        const voteRows = $("div#RCVotesSum div[style='float:right;']");

        if (chamber === "H") {
          const voteData = {
            house_y: Number(voteRows[0].children[0].data),
            house_n: Number(voteRows[1].children[0].data),
            house_e: Number(voteRows[2].children[0].data),
            house_nv: Number(voteRows[3].children[0].data)
          };

          const totalVoters = voteData.house_y + voteData.house_n;
          voteData.house_margin = voteData.house_y - Math.ceil((2/3) * totalVoters);
          return Promise.resolve(voteData);
        } else {
          const voteData = {
            senate_y: Number(voteRows[0].children[0].data),
            senate_n: Number(voteRows[1].children[0].data),
            senate_nv: Number(voteRows[2].children[0].data)
          };

          const totalVoters = voteData.senate_y + voteData.senate_n;
          voteData.senate_margin = voteData.senate_y - Math.ceil((2/3) * totalVoters);
          return Promise.resolve(voteData);
        }
      });
    });
};

const main = () => {
  Promise.all(bills.map((bill) => {
    return Promise.all([ getChamberVote(bill, 'H'), getChamberVote(bill, 'S') ])
      .then(([ houseVote, senateVote ]) => {
      return Promise.resolve(Object.assign(bill, houseVote, senateVote));
    });
  }))
    .then((billData) => {
      return Promise.resolve(
        Array.from(new Set(billData.map((b) => b.year).sort((a, b) => a - b)))
        .map((billYear) => {
          const serializedBillYear = billData.filter((b) => b.year === billYear)
            .map((b) => {
              return Object.fromEntries(
                Object.keys(b).map((key) => [`${key}_${b.school}`, b[key]])
              );
            })
            .reduce((acc, x) => {
              for (var key in x) acc[key] = x[key];
              return acc;
            }, {});

          for (var key in serializedBillYear) {
            if (keysToRemove.some((kr) => key.startsWith(kr))) delete serializedBillYear[key];
          }

          return { ...{ year: billYear }, ...serializedBillYear};
      }));
    })
    .then((serializedBillData) => {
      let str = Object.keys(serializedBillData[0]).join(',');
      str += "\n";
      str += serializedBillData.map((bd) => Object.values(bd).join(',')).join("\n");

      let str2 = `year,Penn State,Pitt,Temple,Lincoln\n`;
      str2 += serializedBillData.map((bd) => {
        return [bd.year, bd.house_margin_PSU, bd.house_margin_PITT, bd.house_margin_TEMPLE, bd.house_margin_LINCOLN].join(',');
      }).join("\n");

      return Promise.all([
        writeFile('bills.csv', str),
        writeFile('bills-margin-h.csv', str2)
      ]);
    });
};

main();
