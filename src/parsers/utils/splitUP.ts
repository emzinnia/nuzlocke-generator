export function splitUp(arr, n) {
    const rest = arr.length % n; // how much to divide
    let restUsed = rest; // to keep track of the division over the elements
    const partLength = Math.floor(arr.length / n);
    const result: any[] = [];

    for (let i = 0; i < arr.length; i += partLength) {
        let end = partLength + i,
            add = false;

        if (rest !== 0 && restUsed) {
            // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(arr.slice(i, end)); // part of the array

        if (add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
}
