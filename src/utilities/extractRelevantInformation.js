/**
 * Converts a Roman numeral to an integer equivalent.
 *
 * @param {string} semesterInRoman - The Roman numeral representing a semester.
 * @return {number} The integer equivalent of the Roman numeral.
 */
export function convertRomanNumeralToInteger(semesterInRoman) {
  console.log(semesterInRoman)
  switch (semesterInRoman) {
    case "I":
      return 1;
    case "II":
      return 2;
    case "III":
      return 3;
    case "IV":
      return 4;
    case "V":
      return 5;
    case "VI":
      return 6;
    case "VII":
      return 7;
    case "VIII":
      return 8;
    case "IX":
      return 9;
    case "X":
      return 10;
  }
}
