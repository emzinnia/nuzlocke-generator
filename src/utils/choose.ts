// tslint:disable-next-line:insecure-random
export const choose = <T>(arr: T[]) =>
    arr[Math.floor(Math.random() * arr.length)];
