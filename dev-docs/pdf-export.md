# PDF Export

## Goal
Generate a final document with the layout defined by the user.

## Expected process
1. Convert the visual preview to real coordinates in millimeters.
2. Insert each item on the corresponding page.
3. Adjust rotation and scale according to the configured values.
4. Save the PDF with a default name like `layout.pdf`.

## Points of attention
- preserve image aspect ratio
- respect page margins
- prevent items from going out of bounds
- allow export per page or per full project
