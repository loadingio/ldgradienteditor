# ldGradientEditor

Minimalist Gradient Editor by loading.io. Features:

 * Lightweight
   - less than 4k ( no colorpicker, zipped ), less than 20k ( with colorpicker, zipped )
 * Vanilla - jQuery/react/angular/vue free.
   - optional dependency to ldColorPicker and ldColor for color editing

# Usage

include necessary css and js files:

    ````
    <link rel="stylesheet" type="text/css" href="ldge.min.css"/>
    <script src="ldColor.min.js"></script>
    <script src="ldcp.min.js"></script>
    <script src="ldge.min.js"></script>

    ````
construct the editor object with a root element and an array of gradient color:

    ````
    var editor = new ldGradientEditor({root: "#container", colors: ["#f0f", "#0ff"]});
    ````
# License

MIT License.
