/*
 * Sorting Algo Visualized - by Juan Mendez
 * Visualize a select few sorting algorithms with a list of integers of a given length.
 * NOTES Due to constraints in the interpreter:
 * Graph types:
 * - "bar" = Bar graph.
 * - "dot" = Dot graph.
 * - "color wheel" = Color wheel graph.
 * - "color palette" = Color palette graph. 
 * Algorithms:
 * - "bubble" = Bubble sort.
 * - "quick" = Quick sort.
 * - "cocktail" = Cocktail Shaker sort.
 * - "merge" = Merging sort.
 * - "heapsort" = Heap sort.
 * Screens: (Outdated names for old project... wontfix)
 * - "ye" = Loading/initialization screen.
 * - "quick" = Raw data screen.
 * - "bubble" = Visualizer screen.
 * How it works:
 * - Every swap or array change is recorded; all array modifications are snapshotted into a large list.
 * - Due to the poor performance of the canvas in code.org, and other reasons, this list is traversed
 * and each "step" is drawn on the canvas.
 * - However, for the color wheel and palette: the main steps list is traversed and only differences
 * between each step are recorded and used to draw. This is because the palette and wheel do not need to
 * be cleared every step-- as every line drawn overlaps the previously drawn line.\
 *
 * [FAQ]
 * Could've it been done more efficiently?
 * - The easy answer is: Yes. Yes it really could've.
 * - The slightly-longer answer is: Of-absolutely-course! A more efficient model may have been to update the
 * visuals in real-time, rather than a main documenting list!
 * Why wasn't it optimized even more?
 * - The even easier answer is: I realized other ways I could've implemented the visualization when
 * I was halfway finished-- so due to time constraints, I continued working with this structure of
 * visualization anyway.
 */
/// Here is the slow initialization: ///
var initialized = false;
setScreen("ye");
 
/// Globals ///
var halt = false; /// Global halt visualization
var graphType = "bar"; /// Global graph type to draw
var soundFlag = true; /// Global allow sound boolean
var swapSteps = []; /// Global visual highlight list (highlights values, NOT indexes)
var textSteps = []; /// Global swap text list
var dataSteps = []; /// Global data snapshot list

function resetSteps() {
  dataSteps = [];
  swapSteps = [];
  textSteps = [];
}


///// Ye Screen ///////////////////////////
var yeProgressBar_bg = "black";
var yeProgressBar_fg = "green";
var yeProgress = 0; // Count

setupYeProgress("black", "green");

/*
 * Setup the yeProgressBar. Can be called to function as a clear call.
 * bg - Background color.
 * fg - Foreground color.
 */
function setupYeProgress(bg, fg) {
  yeProgressBar_bg = bg;
  yeProgressBar_fg = fg;
  
  setActiveCanvas("yeProgressBar");
  setStrokeColor(bg);
  setFillColor(bg);
  rect(0, 0, getProperty("yeProgressBar", "width"), getProperty("yeProgressBar", "height"));
}

/*
 * Calls setupYeProgress with default parameters; Clears the yeProgressBar.
 * returns: 0.
 */
function clearYeProgress() {
  setupYeProgress(yeProgressBar_bg, yeProgressBar_fg);
  return 0;
}

/*
 * Update the progress in the yeProgressBar.
 * Caculates the percentage of l and o (l/o).
 * l - Progress.
 * o - Out of.
 */
function updateYeProgress(l, o) {
  setActiveCanvas("yeProgressBar");
  setFillColor(yeProgressBar_fg);
  setStrokeColor(yeProgressBar_bg);
  rect(0, 0, (l / o) * getProperty("yeProgressBar", "width"), getProperty("yeProgressBar", "height"));
}


/*
 * Set the loading text for the 'ye' screen.
 */
function setLoadingText(t) {
  setText("yeLoadText", t);
}

///////Trigonometry///////////////////////////
/*
 * Sine and cosine values from 0 to 359 degrees are pre-stored
 * for faster access to their respective values than Math.sin etc...
 */
var sine = [];
var cosine = [];
// Store
var toRad = Math.PI / 180;
for (var deg = 0; deg < 360; deg++) {
  sine.push(Math.sin(deg * toRad, 1));
  cosine.push(Math.cos(deg * toRad, 1));
  setLoadingText("Loading (" + deg + "/360)");
  updateYeProgress(yeProgress++, 360);
}
deg = null;
yeProgress = clearYeProgress();


/*
 * Get the value of sin(u + v).
 */
function sinPlus(u, v) {
  return (sine[u] * cosine[v]) + (cosine[u] * sine[v]);
}

/*
 * Get the value of cos(u + v).
 */
function cosPlus(u, v) {
  return (cosine[u] * cosine[v]) - (sine[u] * sine[v]);
}

///////Color Wheel Optimization///////////////
/*
 * Pre-stored RGB array values for color wheels from 0-359 degrees.
 * Intent: Optimize color wheel/palette drawing.
 */
var colorWheelAt = [];
for (var cwv = 0; cwv < 360; cwv++) {
  colorWheelAt.push(colorWheelRGB(cwv));
  setLoadingText("Loading (" + cwv + "/360)");
  if (cwv == 359) {
    initialized = true;
  }
  updateYeProgress(yeProgress++, 360);
}
cwv = null;
yeProgress = clearYeProgress();

/// Finished loading ///
if (initialized) {
  setLoadingText("Done!");
  setScreen("intro");
}


/*
 * Use the increase or decrease formula for the degree given
 * on a color wheel.
 * value - Degree value on color wheel.
 * upper - Upper limit of the increase/decrease.
 * inc - Increase formula if true, otherwise decrease is used.
 * returns: Value of the applied formula.
 */
function getColorWheelValue(value, upper, inc) {
  if (inc == true) {
    return (4.25 * (upper -value)) - 0.83;
  } else {
    return (-4.25 * (upper - value)) + 254.17;
  }
}

/*
 * Get the proper RGB values in the color wheel given value degree.
 * value - Degree, [0, 360].
 * returns: Array of RGB values [R, G, B].
 */
function colorWheelRGB(value) {
  var red = 0;
  var green = 0;
  var blue = 0;
  /// Red
  if ((value >= 0 && value <= 60) || (value >= 300 && value <= 360)) {
    red = 255;
  }
  if ((value >= 120) && (value <= 240)) {
    red = 0;
  }
  if ((value > 60) && (value < 120)) {
    //red = (-4.25 * (120 - value)) + 254.17;
    red = getColorWheelValue(value, 120, true);
  }
  if ((value > 240) && (value < 300)) {
    red = getColorWheelValue(value, 300, false);
  }
  /// Green
  if ((value > 0) && (value < 60)) {
    //green = ((4.25 * value) - 0.83);
    green = getColorWheelValue(value, 60, false);
  }
  if ((value >= 60) && (value <= 180)) {
    green = 255;
  }
  if ((value > 180) && (value < 240)) {
    //green = (-4.25 * (240 - value)) + 254.17;
    green = getColorWheelValue(value, 240, true);
  }
  if ((value >= 240) && (value <= 360)) {
    green = 0;
  }
  /// Blue
  if ((value > 0) && (value <= 120)) {
    blue = 0;
  }
  if ((value > 120) && (value < 180)) {
    //blue = (4.25 * (180 - value)) - 0.83;
    blue = getColorWheelValue(value, 180, false);
  }
  if ((value >= 180) && (value <= 300)) {
    blue = 255;
  }
  if ((value > 300) && (value <= 360)) {
    //blue = (-4.25 * (360 - value)) + 254.17;
    blue = getColorWheelValue(value, 360, true);
  }
  return [red, green, blue];
}


///////Sorting Algorithms/////////////////////

/*
 * Using the last element as the pivot, move all
 * smaller elements before pivot and larger after.
 * (For quick sort)
 * arr - Array.
 * lo - Low index.
 * hi - High index.
 */
function partition(arr, lo, hi) {
  var pivot = arr[hi];
  var i = (lo-1); // index of smaller element
  for (var j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      i++;
      swap(arr, i, j);
    }
  }
  // Swap i + 1 with pivot
  swap(arr, i+1, hi);
  return i+1;
}

/*
 * Quick sort algorithm.
 * arr - Array to sort.
 * lo - Low index.
 * hi - High index.
 */
function quickSort(arr, lo, hi) {
  if (lo < hi) {
    var partIndex = partition(bubbleChartData, lo, hi);
    // Sort elements before and after partition index
    quickSort(arr, lo, partIndex - 1); // Before
    quickSort(arr, partIndex + 1, hi); // After
  }
}

function cocktailSort(arr) {
  var swapped = false;
  do {
    swapped = false;
    for (var i = 0; i < arr.length - 2; i++) {
      if (arr[i] > arr[i + 1]) { // Wrong order?
        swap(arr, i, i + 1);
        swapped = true;
      }
    }

    if (!swapped)
      break;
        
    swapped = false;
    for (i = arr.length - 2; i != -1; i--) {
      if (arr[i] > arr[i + 1]) {
        swap(arr, i, i + 1);
        swapped = true;
      }
    }
  } while (swapped); // No more swaps = in order
}

function bubbleSort(arr) {
  var n = arr.length;
    for (var i = 0; i < n-1; i++) {
      for (var j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j + 1]) {
          swap(arr, j, j+1);
        }
      }
    }
}

/*
 * Merge subarrays of arr ([l..m] + [m+1..r]), to use with mergeSort.
 * origArray - Original (before sorted) array, for recording.
 * arr - Main array.
 * l - Left index.
 * m - Middle index.
 * r - Right index;
 */
function mergeArray(origArray, arr, l, m, r) {
  // Length of subarrays
  var llen = m - l + 1;
  var rlen = r - m;
  // Create temporary subarrays
  var left = [];
  var right = [];
  for (var i = 0; i < llen; i++) {
    left.push(arr[l + i]);
  }
  for (var j = 0; j < rlen; j++) {
    right.push(arr[m + 1 + j]);
  }
  
  // Actual merging
  i = 0; // Left index
  j = 0; // Right index
  var k = l; // Merged subarray index
  while (i < llen && j < rlen) {
    if (left[i] < right[j]) { // L < R
      arr[k] = left[i];
      pushStep(origArray, arr[k], true);
      i++;
    } else { // L > R
      arr[k] = right[j];
      pushStep(origArray, arr[k], true);
      j++;
    }
    k++; // Next
  }

  // Copy remaining items
  while (i < llen) {
    arr[k] = left[i];
    i++;
    k++;
  }
  while (j < rlen) {
    arr[k] = right[j];
    j++;
    k++;
  }
}

/*
 * Merge sort given array [leftIndex..rightIndex].
 * origArray - Original (before sorted) array, for recording.
 * arr - Array to merge sort.
 * leftIndex - Left index to use.
 * rightIndex - Right index to use.
 */
function mergeSort(origArray, arr, leftIndex, rightIndex) {
  if (leftIndex < rightIndex) { // Prevent breaking it
    var mid = Math.floor((leftIndex + rightIndex) / 2);
    mergeSort(origArray, arr, leftIndex, mid);
    //pushStep(origArray, leftIndex, true);
    mergeSort(origArray, arr, mid + 1, rightIndex);
    //pushStep(origArray, mid + 1, true);
    mergeArray(origArray, arr, leftIndex, mid, rightIndex);
  }
  //pushStep(origArray, null, false); // Reset highlight accumulation
  pushStepCancel(origArray);
}

/*
 * Make a heap from given array [0..n], with root at node i.
 */
function heapify(arr, n, i) {
  var left = 2 * i + 1;
  var right = 2 * i + 2;
  var max = i;

  // left > root?
  if (left < n && arr[left] > arr[max]) {
    max = left;
  }
  // right > largest child?
  if (right < n && arr[right] > arr[max]) {
    max = right;
  }
  // Largest != root?
  if (max != i) {
    swap(arr, max, i);
    heapify(arr, n, max);
  }
  pushStep(arr, null);
}

/*
 * Heapsort given array.
 */
function heapSort(arr) {
  var n = arr.length;
  // Make heaps (type of binary tree)
  for (var i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  for (i = n - 1; i >= 0; i--) {
    swap(arr, 0, i);
    heapify(arr, i, 0);
    pushStep(arr, null);
  }
}

/*
 * Sort array using insertion sort.
 * array - Array to sort.
 * origArr - Original, full array; for bucket sort use.
 */
function insertionSort(array, origArr) {
  // Which array to use for pushStep()
  var pushArr = (origArr == null) ? array : origArr;

  for(var i = 0; i < array.length; i++) {
    var temp = array[i];
    var j = i - 1;
    while (j >= 0 && array[j] > temp) {
      array[j + 1] = array[j];
      pushStep(pushArr, j + 1);
      j--;
    }
    array[j + 1] = temp;
    pushStep(pushArr, j + 1);
  }
  return array;
}

/*
 * Normalize a value (0.0-1.0).
 * x - Value to normalize.
 * min - Minimum from list.
 * max - Maximum from list.
 */
function normalize(x, min, max) {
  return (x - min) / (max - min);
}

/*
 * Sort arr with length n using bucket sort.
 */
function bucketSort(arr, n) {
  // Init buckets
  var buckets = [];
  for (var bI = 0; bI < n; bI++) {
    buckets.push([]);
  }
  //console.log("buckets len = " + buckets.length);
  
  // Put arr into buckets
  index = 0;
  for (var i = 0; i < n; i++) {
    // Assuming the given arr is (1..n)
    var index = Math.floor(n * normalize(arr[i], 1, n));
    if (index == n) {
      index--;
    }
    //console.log("calculated index = " + index);
    buckets[index].push(arr[i]);
  }
  
  // Sort
  for (i = 0; i < n ; i++) {
    insertionSort(buckets[i], arr);
  }
  
  // Put buckets together
  var aIndex = 0;
  for (i = 0; i < n; i++) {
    for (var j = 0; j < buckets[i].length; j++) {
      arr[aIndex++] = buckets[i][j];
      pushStep(arr, aIndex);
    }
  }
}

///////Array and chart functions//////////////

/*
 * Create a custom rendered chart.
 * cId - Canvas id.
 */
function chart(cId) {
  this.w = getProperty("bubbleCanvas", "width");
  this.h = getProperty("bubbleCanvas", "height");
  this.centerX = this.w / 2;
  this.centerY = this.h / 2;
  this.toRad = Math.PI / 180; /// Multiply to convert deg -> rad.
  this.color = "green";
  this.highlight = "red";
  this.background = "black";
  // NOTE: These are not coordinates of the chart itself, rather for graph data
  this.x = 0;
  this.y = 0;
  this.circleRadius = this.h * 0.3; // Assuming w > h
  //this.rad90 = Math.PI / 2; // 90 degrees in radians.


  /*
   * Set the 'background,' which is a canvas behind the chart canvas.
   */
  this.setBackground = function(col) {
    this.background = col;
    setActiveCanvas("chartBackgroundCanvas");
    setFillColor(this.background);
    rect(0, 0, this.w, this.h); // Assumes background canvas is same size
    setActiveCanvas(cId);
  };

  /*
   * Clear the chart canvas.
   */
  this.clear = function() {
    setActiveCanvas(cId);
    clearCanvas();
  };

  /*
   * Check if previousData[i] != data[i].
   */
  this.previousIsDiff = function(i, data, previousData) {
    return previousData != null && previousData[i] != data[i];
  };

  /*
   * FOR USE WITH COLOR WHEEL/PALETTE.
   * Convert steps list (array of arrays) into the required format
   * for the color wheel/palette data input. This creates a new
   * steps list where each array contains values of data indexes
   * that are different from the previous data step. This way,
   * even more efficiency may be met DURING the visualiation by
   * not needing to do so DURING each call of draw().
   * Using this method of drawing for the wheel/palette does:
   *  O(n^2) to O(n).
   * For draw(); we sacrifice pre-visual loading time efficiency
   * in order to have a faster visualiation.
   *
   * allData - Steps list.
   * returns: New steps list to use for the visualization.
   */
  this.convertToColorData = function(allData) {
    var newStepsList = [];

    // Fill new steps list with empty 'steps' to keep same length
    for (var x = 0; x < allData.length; x++) {
      newStepsList.push([]);
    }

    var prev = null; // Previous step
    
    // Iterate through each step O(n^2)
    for (var i = 0; i < allData.length; i++) {
      prev = allData[i - 1];
      if (prev != null) {
        // Check for differences between previous and current steps data
        // Assuming step data length is constant for every step
        for (var j = 0; j < allData.length; j++) {
          if (allData[i][j] != prev[j]) { // Push different from last step values
            newStepsList[j].push(prev[j]);
          }
        }
      }
    }
    return newStepsList;
  };

  /*
   * Set current stroke and fill color.
   * col - Color to use.
   */
  this.setCurrentColor = function(col) {
    setStrokeColor(col);
    setFillColor(col);
  };

  /* [private]
   * Get the bar/dot drawing data for data[i]. ONLY FOR BAR/DOT, albeit not enforced...
   * i - Index.
   * data - Array of integers.
   * hdata - Array of indexes to highlight.
   * width - Bar width or dot diameter.
   * graph - Graph type; refer to NOTES. Only bar or dot!
   * max - Maximum integer in data (also data.length).
   * cHeight - Canvas height.
   * returns: Object of drawing data:
   *  -> Object
   *  --> "color"   : Color RGB array ([R,G,B]).
   *  --> "height"  : Height (#).
   *  --> "x"       : X coordinate (#).
   *  --> "y"       : Y coordinate (#).
   */
  this._getDrawData = function(i, data, hdata, width, graph, max, cHeight) {
    var col = null;
    // Highlight?
    if (hdata != null && hdata.indexOf(data[i]) != -1) { // Found: highlight
      //setFillColor(this.highlight);
      col = this.highlight;
    } else { // Not found; Use normal color
      //setFillColor(this.color);
      //setStrokeColor(this.color);
      col = this.color;
    }

    // Bar height
    var bh = (data[i] * (cHeight / max));

    return {
      color : col,
      height : bh,
      x : i * width,
      y : cHeight - bh
    };
  };

  /*
   * Draw a datum by "clearing" the old drawing in place and drawing the new value.
   * ONLY Use for 'bar' or 'dot' graphs.
   * graph - Graph type, 'bar' or 'dot.'
   * width - Bar width or dot diameter.
   * drawDataObj - Draw data object returned by _getDrawData.
   */
  this.drawStdDatum = function(graph, width, drawDataObj) {
    var x = drawDataObj.x;
    var y = drawDataObj.y;
    var he = drawDataObj.height;
    this.setCurrentColor(drawDataObj.color);
    if (graph == "bar") {
      rect(x, y, width, he);
    } else if (graph == "dot") {
      circle(x, y, width / 2);
    }
  };

  /*
   * Draw the chart. NOTE:
   * Color wheel & palette have different data input interpretations than the other graph types.
   * SEE: convertToColorData(). Pushing normal, unconverted data with those graph types MAY
   * result in undesired/inefficient behavior during visualization.
   * graph - Graph type to render; refer to NOTES.
   * data - Array of integers.
   * hdata - Array of indexes to highlight.
   * [deprecated]previousData - Array 'snapshot' of the last data passed. Set to undefined if no such exists.
   *  Only used when graph = 'color wheel,' as it is used to optimize drawing due to the slow
   *  and inefficient default drawing procedure--which is just redrawing every line every call.
   * toShuffle - Set to true if shuffling color wheel, otherwise: keep false/null/undefined.
   * n - Sample size (for color palette).
   */
  this.draw = function(graph, data, hdata, previousData, toShuffle, n) {
    setActiveCanvas(cId);
    if (data !== undefined) {
      if (graph != "color wheel" && graph != "color palette") {
        setFillColor(this.background);
        rect(0, 0, this.w, this.h);
      }
  
      //console.log("Given draw data length: " + data.length);

      // Because the max is assumed to be length of the array (since [1..n])
      var max = data.length;
      var lineWidth = this.w / (n != null ? n : data.length);

      for (var i = 0; i < data.length; i++) {
        if (data != []) {
          if (graph != "color wheel" && graph != "color palette") {
            // Get draw data for both current and previous
            var currentDrawData = this._getDrawData(i, data, hdata, lineWidth, graph, max, this.h);
            this.x = currentDrawData.x;
            this.y = currentDrawData.y;
            // Finally draw
            this.drawStdDatum(graph, lineWidth, currentDrawData);
          } else { // graph == 'color wheel' or 'color palette'. ASSUMES DATA LENGTH IS 360.
            /* Modify to proper color of the color wheel */
            var rgbVals = colorWheelAt[data[i] - 1];
            var rgbActual = rgb(rgbVals[0], rgbVals[1], rgbVals[2], 255);
            this.setCurrentColor(rgbActual);
  
            if (graph == "color wheel") {
              this.x = this.centerX + (sinPlus(toShuffle ? i : data[i], 90) * this.circleRadius);
              this.y = this.centerY + (cosPlus(toShuffle ? i : data[i], 90) * this.circleRadius);
              //setStrokeWidth(1);
              line(this.centerX, this.centerY, this.x, this.y);
              //circle(this.x, this.y, 1);
            } else if (graph == "color palette") {
              this.x = (toShuffle ? i : data[i]) * lineWidth;
              rect(this.x, 0, lineWidth, this.h);
              //setStrokeWidth(lineWidth);
              //line(this.x, 0, this.x, this.h);
            }
          } // END else
        } // END if
      } // END for
    }
  };
  
  // Init
  this.setBackground(this.background);
}

/*
 * Swap two values in an array
 * arr - Array.
 * in1, in2 - Indexes to swap from arr.
 */
function swap(arr, in1, in2) {
  // Swap
  var atemp = arr[in1];
  var btemp = arr[in2];
  arr[in1] = btemp;
  arr[in2] = atemp;
  // Snapshot
  swapSteps.push([in1, in2]);
  dataSteps.push(arr.slice());
}

/*
 * Push recorded data for visualization (no swap).
 * arr - Array.
 * highlight - Index to highlight.
 * accum - Append index to highlight?
 */
function pushStep(arr, highlight, accum) {
  if (highlight != "NA") {
    if (accum && swapSteps.length >= 1) {
      var cstep = [highlight];
      swapSteps.push(cstep.concat(swapSteps[swapSteps.length-1]));
    } else {
      swapSteps.push([highlight, highlight]);
    }
  } else {
    swapSteps.push([]);
  }

  dataSteps.push(arr.slice());
}

/*
 * Stop the highlight accumulation in pushStep().
 * arr - Array to snapshot.
 */
function pushStepCancel(arr) {
  pushStep(arr, "NA", false);
}

/*
 * Shuffle an array.
 * returns: Shuffled array.
 */
function shuffleArray(arr) {
  var copy = arr;
  var index = arr.length-1;
  while (index-- > 0) {
    var randIndex = randomNumber(0, arr.length-1);
    // Swap
    swap(arr, index, randIndex);
  }
  return copy;
}

/* 
 * Create an array of numbers 1-max.
 * returns: Suffled chart array
 */
function rangedArray(max) {
  var chart = [];
  for (var i = 1; i < max+1; i++) {
    chart.push(i);
  }
  return chart;
}

/*
 * Visualize a sorting algorithm (already sorted).
 * graph - Graph type to use; refer to NOTES.
 * steps - Array of the recorded steps.
 * swsteps - Array of the recorded swap steps. Assumed to have same length of steps.
 * [deprecated] txtsteps - Array of the recorded text steps. Assumed to have same length of steps.
 * speed - Interval in ms.
 * chart - Chart object (from chart()).
 * stateFieldId - Text field for state.
 * finalTime - Actual time taken to run algorithm (will display after visuals).
 * buttons - Array of buttons to hide while visualizing.
 */
function visualizeSort(graph, steps, swsteps, txtsteps, speed, chart, stateFieldId, finalTime, buttons) {
  if (steps.length < 1) {
    return;
  }


  /*
   * Hide the elements in 'buttons' array.
   * flag - Hides elements if true, otherwise shows..
   */
  function hideElements(flag) {
    for (var i = 0; i < buttons.length; i++) {
      setProperty(buttons[i], "hidden", flag);
      // Disable amount slider on fixed sample size graphs
      if (buttons[i] == "bubbleAmtSlider" && (graph == "color wheel" || graph == "color palette")) {
        setProperty(buttons[i], "hidden", true);
      }
    }
  }


  var iter = 0; // Track which step to use in loop

  setText(stateFieldId, "Loading visualization...");
  var actualSteps = steps;
  if (graph == "color wheel" || graph == "color palette") {
    actualSteps = chart.convertToColorData(steps);
    console.log(actualSteps);
  }

  // Determine amount of iterations
  var times = actualSteps.length;
  setText(stateFieldId, "Visualization iterations: " + times);


  // Timed loop
  function call() {
    hideElements(true);
    if (!halt) {
      stopSound();
      
      // Draw
      if (actualSteps[iter] != []) {
        chart.draw(graph, actualSteps[iter], swsteps[iter], actualSteps[iter - 1], false, steps[0].length);
        
        // Play sound
        if (soundFlag) {
          playSound("assets/blep.mp3");
        }
      }

      // Next
      iter++;
      if (iter < times) { // Loop again
        setTimeout(call, speed);
      } else { // Loop has completed
        stopSound();
        if (soundFlag)
          playSound("Microwave_oven_ding_sound[Mp3Converter.net].mp3");

        hideElements(false);
        setText(stateFieldId, "Algorithm time taken: " + finalTime + "ms. for " + steps[0].length + " integers.");
      }
    } else {
      halt = false;
      hideElements(false);
    }
  }

  call();
}

/*
 * Execute sorting algorithm and visualization with given array.
 * arr - Array to sort.
 */
function executeSort(arr) {
  // Shuffle if already sorted
  if (sorted) {
    shuffleChart();
  }

  // Sort and store each step into array, then show
  resetSteps();
  var time = getTime(); // Start timing
  if (algorithm == "bubble") {
    console.log("Bubble sort called");
    bubbleSort(arr);
  } else if (algorithm == "quick") { // Quick sort
    console.log("Quick sort called");
    quickSort(arr, 0, arr.length - 1);
  } else if (algorithm == "cocktail") { // Cocktail sort
    console.log("Cocktail shaker sort called");
    cocktailSort(arr);
  } else if (algorithm == "merge") { // Merge sort
    console.log("Merge sort called");
    mergeSort(arr, arr, 0, arr.length - 1);
  } else if (algorithm == "heapsort") { // Heap sort
    console.log("Heapsort called");
    heapSort(arr);
  } else if (algorithm == "insertion") { // Insertion sort
    console.log("Insertion sort called");
    insertionSort(arr);
  } else if (algorithm == "bucket") { // Bucket sort
    console.log("Bucket sort called");
    bucketSort(arr, arr.length);
  }

  // Calculate time elapsed
  time = getTime() - time;
  // Visualize
  executeVisual(time);
  // Done
  sorted = true;
}

/*
 * Start animating the algorithm.
 * time - Calculated time elapsed to display after finish.
 */
function executeVisual(time) {
  if (dataSteps.length > 0) {
    visualizeSort(graphType ,dataSteps, swapSteps, textSteps, bubbleSpeed,
      bubbleChart, "bubbleStatus", time,
      [ "bubbleTimeSlider", "bubbleSortBtn", "bubbleShuffleBtn",
      "algoDrop", "bubbleAmtSlider", "graphDropdown", "bbBackBtn", "toRawBtn",
      "finalBtn" ]
    );
    // Set raw data
    setText("quickRawText", "" + JSON.stringify(dataSteps));
  }
}

//////////////////////////////////////////////

/* Notes:
 * 'bubbleX' refers to bubble screen, not necessarily the sort.
 */


/* Bubble SCREEN */

setText("soundlabel", "\uD83D\uDD0A");

// Init
//var useBubble = true; // False = use quicksort
var algorithm = "bubble"; // bubble, quick, cocktail
var bubbleMax = getNumber("bubbleAmtSlider");
var bubbleSpeed = getNumber("bubbleTimeSlider");
var bubbleChart = new chart("bubbleCanvas");
var sorted = false;
var bubbleChartData = [];

/*
 * Update bubbleMax to the current slider value.
 */
function updateAmtSlider() {
  bubbleMax = getNumber("bubbleAmtSlider");
  shuffleChart();
}


// Semi-abstract; meant to be for this local block of code
/*
 * Update the chart to reflect new data.
 */
function reloadChart(data) {
  bubbleChart.clear();
  bubbleChartData = data;
  bubbleChart.draw(graphType, bubbleChartData, [], [], true);
}
/*
 * Reload the chart with a shuffled array. Uses bubbleMax for max.
 * Sets sorted = false.
 */
function shuffleChart() {
  reloadChart(shuffleArray(rangedArray(bubbleMax)));
  sorted = false;
}

shuffleChart(); // Init call //

onEvent("bubbleTimeSlider", "input", function() {
  // Adjust speed
  bubbleSpeed = getNumber("bubbleTimeSlider");
});
// Now that I think about it, I could've made a call to click this button instead of making shuffleChart().
onEvent("bubbleShuffleBtn", "click", function() {
  // Shuffle data
  shuffleChart();
});
onEvent("bubbleAmtSlider", "input", function() {
  updateAmtSlider();
});

// Algorithm selection
onEvent("algoDrop", "change", function() {
  algorithm = getText("algoDrop").toLowerCase();
  console.log("Algorithm set to " + algorithm);
});

// Graph selection
onEvent("graphDropdown", "change", function() {
  graphType = getText("graphDropdown").toLowerCase();
  bubbleChart.clear();
  if (graphType == "color wheel" || graphType == "color palette") {
    setProperty("bubbleAmtSlider", "hidden", true);
    bubbleMax = 360;
    shuffleChart();
  } else {
    setProperty("bubbleAmtSlider", "hidden", false);
    updateAmtSlider();
  }
  console.log("Graph type set to: " + getText("graphDropdown"));
});

// Sort button
onEvent("bubbleSortBtn", "click", function() {
  executeSort(bubbleChartData);
});

// Halt button
onEvent("bubbleHalt", "click", function() {
  halt = true;
  sorted = true; // To reshuffle on resort
});

/* Navigation buttons */

onEvent("bubbleButton", "click", function() {
  setScreen("bubble");
});
onEvent("quickButton", "click", function() {
  setScreen("quick");
});

// Bubble
onEvent("bbBackBtn", "click", function() {
  setScreen("intro");
});
// Go to raw data screen
onEvent("toRawBtn", "click", function() {
  setScreen("quick");
});
// Quick
onEvent("button3", "click", function() { // To: sort
  setScreen("bubble");
});
onEvent("button4", "click", function() { // To: intro
  setScreen("intro");
});
onEvent("soundCheckbox", "click", function() {
  soundFlag = !soundFlag; // toggle
  console.log("Sound toggled to " + soundFlag);
});
onEvent("finalBtn", "click", function() {
  console.log("Graphing to sorted array...");
  reloadChart(rangedArray(bubbleMax));
  sorted = true;
});
