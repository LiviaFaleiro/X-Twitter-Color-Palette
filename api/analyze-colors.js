export default function handler(req, res) {
    const { colors } = req.body;
    
    function analyzeColors(colors) {
      let warmColors = 0;
      let coolColors = 0;
      
      colors.forEach(color => {
        const hsl = hexToHSL(color);
        if ((hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 320) {
          warmColors++;
        }
        else if (hsl.h > 180 && hsl.h < 320) {
          coolColors++;
        }
      });
      
      if (warmColors > coolColors) {
        if (colors.some(c => hexToHSL(c).s > 70)) {
          return {
            personality: "Energetic, outgoing, and full of life",
            season: "Summer: These vibrant warm tones reflect the energy of sunny days"
          };
        } else {
          return {
            personality: "Grounded, creative, and nurturing",
            season: "Autumn: Rich, warm hues that mirror falling leaves"
          };
        }
      } else {
        if (colors.some(c => hexToHSL(c).l > 70)) {
          return {
            personality: "Optimistic, refreshing, and inspiring",
            season: "Spring: Fresh and bright like new beginnings"
          };
        } else {
          return {
            personality: "Elegant, mysterious, and confident",
            season: "Winter: Cool and sophisticated tones"
          };
        }
      }
    }
    
    const analysis = analyzeColors(colors);
    res.status(200).json(analysis);
}
// This code defines a function called analyzeColors that takes an array of hex color codes as input and returns an object with two properties: personality and season.
// The function first initializes two variables, warmColors and coolColors, to 0.
// It then loops through each color in the colors array and converts it to HSL (Hue, Saturation, Lightness) format using the hexToHSL function.
// If the hue (h) of the color is between 0 and 60 or between 320 and 360, it increments warmColors.
// If the hue is between 180 and 320, it increments coolColors.
// After the loop, the function checks which color category (warm or cool) has more colors and assigns a personality and season based on the color's hue and saturation.
// Finally, the function returns an object with the personality and season properties.
// The handler function then calls the analyzeColors function with the colors array from the request body and sends the result as a JSON response with a 200 status code.
// The hexToHSL function is a helper function that converts a hex color code to HSL format. It takes a hex string as input and returns an object with the hue, saturation, and lightness values.
// The hexToHSL function first removes the '#' character from the hex string and converts it to a decimal number using parseInt. It then divides the red, green, and blue values by 255 to normalize them to the range [0, 1].
// The function then calculates the maximum and minimum values of the red, green, and blue values and calculates the hue, saturation, and lightness values using the formulas provided in the Wikipedia article on HSL and HSV.
// Finally, the function returns an object with the hue, saturation, and lightness values.

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return {
        h: h,
        s: s * 100,
        l: l * 100
    };
}
// This code defines a function called hexToHSL that takes a hexadecimal color string as input and returns an object containing the hue, saturation, and lightness values of the color in the HSL color model.
// The function first converts the hexadecimal string to an array of RGB values, then calculates the maximum and minimum RGB values, and finally calculates the hue, saturation, and lightness values using the formulas provided in the Wikipedia article on the HSL color model.
// The function returns an object with three properties: h, s, and l, which represent the hue, saturation, and lightness values of the color, respectively.
// The function can be used to convert any hexadecimal color string to its corresponding HSL values.
