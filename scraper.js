/**
 * table - a bulbapedia table
 * n1 - first item to grab in table row
 * n2 - second item to grab in table row
 */
let extractData = (table, n1 = 1, n2 = 2) => {
    const trs = table.querySelectorAll("tr");
    const result = Array.from(trs).map((tr) => {
        const tds = tr.querySelectorAll("td");
        const tdsArr = Array.from(tds);
        return {
            [tdsArr[1]?.textContent]: tdsArr[2]?.textContent.replace(/\n/, ""),
        };
    });
    return result;
};
