export class RandomNumberGenerator {
    private randomNumbers: number[];
    private i: number = 0;

    constructor(n: number) {
        const numbers = [];
        for(var i = 0; i < n; i++) {
            numbers.push(i);
        }

        var i = numbers.length;
        var j = 0;

        var randomNumbers = [];
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            randomNumbers.push(numbers[j]);
            numbers.splice(j,1);
        }       
        this.randomNumbers = randomNumbers;
    }

    public next() {
        if (this.i < this.randomNumbers.length) {
            return this.randomNumbers[this.i++];
        }

        return null;
    }
}