// ---------------------------------------------------------------------
// Main Function
// ---------------------------------------------------------------------
function Main() {

    // Use the D3 library to read in samples.json.
    d3.json("samples.json").then(data => {
        
        console.log(`Data`)
        console.log(data);

        // Access keys from data
        var names = data.names
        var metadata = data.metadata
        var samples = data.samples

        // Define global layout variables for bar and bubble plots
        var layout1 = {
            title: "Top 10 OTUs found in the selected individual",
            margin: {
                t: 50,
                l: 200
            },
            barmode: "group",
            xaxis: {
                title: {
                    text: 'Sample Values',
                    font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                    }
                }
            }
        };

        var layout2 = {
            title: "Sample Distribution Bubble Chart",
            showlegend: false,
            xaxis: {
                title: {
                    text: 'OTU_IDS',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                },
            },
            yaxis: {
                title: {
                    text: 'Sample Values',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            }
        };

        var layout3 = {
            width: 800,
            height: 600,
            margin: { t: 30, b: 25, l: 25, r: 25 },
            grid: { rows: 2, columns: 2, pattern: "independent" },
            template: {
              data: {
                indicator: [
                  {
                    title: { text: "Belly Button Washing Freq." },
                    mode: "number+delta+gauge",
                    delta: { reference: 9 }
                  }
                ]
              }
            }
        };

        // Create Dropdown Menu
        createDropdown(names);

        // Grab default dataset
        var default_metadata = metadata[0];
        var default_samples = samples[0];
        var default_metadata = metadata[0];

        // Create default demo info and default plots
        DemoInfo(default_metadata);
        makePlots(default_samples, default_metadata, layout1, layout2, layout3);

        // Create event handler to filter data when option is selected from dropdown
        d3.selectAll("#selDataset").on("change", update);        

        // Update window
        function update() {

            //  Use D3 to select the dropdown menu
            var dropdownvalue = d3.select("#selDataset").node().value
           
            // Filter plotting data for the selected option
            samples.map(sample => {
                if (dropdownvalue == sample.id) {
        
                    // ----------------------------------------------------------------------
                    // Update Bar Plot
                    // ----------------------------------------------------------------------
        
                    console.log(`Selected Sample`)
                    console.log(sample)
        
                    // Grab top ten sample values of the selected id
                    /* sample
                    id: "940"
                    otu_ids: (80) [1167, 2859, 482, 2264,...]
                    otu_labels: (80) ["Bacteria;...", "Bacteria;Peptoniphilus, ...", "Bacteria; ...", ...]
                    sample_values: (80) [163, 126, 113, 78, ...] */
        
                    var top_ten_x = sample.sample_values.slice(0,10).reverse();
                    var top_ten_y = sample.otu_ids.slice(0,10).reverse()                 
                    
                    console.log(`Updated Bar Plot Values`)
                    console.log(`x: ${top_ten_x}`)
                    console.log(`y: ${top_ten_y}`)
        
                    // new trace
                    var trace1 = {
                        x: top_ten_x,
                        y: top_ten_y.map(y => `OTU ${y}`),
                        text: sample.otu_labels,
                        type: "bar",
                        orientation: "h"
                    
                    };
                    
                    // trace1
                    var data1 = [trace1];
                    
                    // Update bar plot
                    Plotly.newPlot("bar", data1, layout1);
                    
                    // ----------------------------------------------------------------------
                    // Update Bubble Plot
                    // ----------------------------------------------------------------------
                    
                    // Grab sample values
                    var x = sample.otu_ids;
                    var y = sample.sample_values;
                    
                    console.log(`Updated Bubble Plot Values`)
                    console.log(`x: ${x}`)
                    console.log(`y: ${y}`)
        
                    var trace2 = {
                        x: x,
                        y: y,
                        text: sample.otu_labels,
                        mode: "markers",
                        marker: {                     
                            size: sample.sample_values,
                            sizeref: 0.1,
                            sizemode: 'area',
                            color: sample.otu_ids
                        }
                        
                    };
                    
                    // data
                    var data2 = [trace2];
        
                    // Update bubble plot
                    Plotly.newPlot("bubble", data2, layout2);
        
                }                    
            })

            // ----------------------------------------------------------------------
            // Update Demographic Info and Indicator
            // ----------------------------------------------------------------------
                      
            // Filter new metadata for the selected option
            metadata.map(metadata => {
                if (dropdownvalue == metadata.id) {

                    // Update Demo Info
                    console.log(`New demoinfo`)
                    console.log(metadata)
            
                    // html("") removes content from the current tag
                    d3.selectAll("#sample-metadata").html(" ")   
                    var demo_info = d3.select("#sample-metadata")
                    
                    Object.entries(metadata).forEach(([key, value]) => {
                        demo_info.append("p").text(`${key}:${value}`)
                    })
                    
                    // Update Indicator
                    console.log(`New Washing Frequency`)
                    console.log(metadata.wfreq)


                    var trace3 = {
                        type: "indicator",
                        value: metadata.wfreq,
                        gauge: {axis: {
                                    visible: true,
                                    range: [null,9]
                        }},
                        domain: {row:0, column:0}
                    };
                
                    // data
                    var data3 = [trace3];
                
                    // Create bubble plot
                    Plotly.newPlot("gauge", data3, layout3);
                    

                }
            })



        };

    
    });
        
};

// Call Main function
Main();

// ---------------------------------------------------------------------
// Create Dropdown Menu
// ---------------------------------------------------------------------

function createDropdown (names) {

    //select dropdown id from html
    var dropdown_options = d3.select("#selDataset");  
  
    // Loop through names array and create options in dropdown box
    names.map(name => {                               
      dropdown_options.append("option").attr("value", name).text(name);
  
    })
  };

// ---------------------------------------------------------------------
// Create Demo Info Function
// ---------------------------------------------------------------------

  /* Metadata
  age: 24
  bbtype: "I"
  ethnicity: "Caucasian"
  gender: "F"
  id: 940
  location: "Beaufort/NC"
  wfreq: 2 */


function DemoInfo(metadata) {
    
    console.log(`Default Demo Info`)
    console.log(metadata)

    var demo_info = d3.select("#sample-metadata")
     
    Object.entries(metadata).forEach(([key, value]) => {
        demo_info.append("p").text(`${key}:${value}`)
    })
};

// ---------------------------------------------------------------------
// Create Plots Function
// ---------------------------------------------------------------------

/* sample
id: "940"
otu_ids: (80) [1167, 2859, 482, 2264,...]
otu_labels: (80) ["Bacteria;...", "Bacteria;Peptoniphilus, ...", "Bacteria; ...", ...]
sample_values: (80) [163, 126, 113, 78, ...] */

function makePlots(sample, metadata, layout1, layout2, layout3) {

    // Grab all sample values of the 1st sample
    var sample_values = sample.sample_values;
    var otuIDs = sample.otu_ids;
    var otuLabels = sample.otu_labels;
    var wfreq = metadata.wfreq;

    console.log(`Default metadata`)
    console.log(metadata)
      
    // ---------------------------------------------------------------
    // Bar Plot
    // ---------------------------------------------------------------
    
    // Grab top ten sample values
    var top_ten_x = sample_values.slice(0,10).reverse();
    var top_ten_y = otuIDs.slice(0,10).reverse();


    console.log(`Default Bar Plot Values`);
    console.log(`x: ${top_ten_x}`)
    console.log(`y: ${top_ten_y}`)
    
    
    var trace1 = {
        x: top_ten_x,
        y: top_ten_y.map(y => `OTU ${y}`),
        text: otuLabels,
        type: "bar",
        orientation: "h"
    
    };
    
    // trace1
    var data1 = [trace1];
    
    // Create bar plot  
    Plotly.newPlot("bar", data1, layout1);
    
    // ---------------------------------------------------------------
    // Default Bubble Plot
    // ---------------------------------------------------------------
    
    // Grab sample values
    var x = otuIDs;
    var y = sample_values;
    
    console.log(`Default Bubble Plot Values`)
    console.log(`x: ${x}`)
    console.log(`y: ${y}`)


    var trace2 = {
    x: x,
    y: y,
    text: otuLabels,
    mode: "markers",

    // Marker size and color
    marker: {                     
        size: sample_values,
        sizeref: 0.1,
        sizemode: 'area',
        color: otuIDs
    }
    
    };
    
    // data
    var data2 = [trace2];

    // Create bubble plot
    Plotly.newPlot("bubble", data2, layout2);

    // ---------------------------------------------------------------
    // Default Indicator Chart
    // ---------------------------------------------------------------
    

    var trace3 = {
        type: "indicator",
        value: wfreq,
        gauge: {axis: {
                    visible: true,
                    range: [null,9]
        }},
        domain: {row:0, column:0}
    };

    // data
    var data3 = [trace3];

    // Create bubble plot
    Plotly.newPlot("gauge", data3, layout3);

    

};


