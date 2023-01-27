//Initial setting for jQuery
$(document).ready(() => {
  //Call json file
  const req = new XMLHttpRequest();
  req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
  req.send();
  req.onload = () => {
    //Save given json file
    const json = JSON.parse(req.responseText);

    //Setting svg element
    const width = 1000;
    const wPadding = 60;
    const height = 600;
    const hPadding = 50;
    const svg = d3.select("svg").attr("width", width).attr("height", height);

    const xParser = d3.timeParse("%Y");
    const yParser = (time) => {
      const part = time.split(":");
      return new Date(1970, 0, 1, 0, part[0], part[1])
    };

    const xScale = d3.scaleTime().domain([d3.min(json, d => xParser(d.Year - 1)), d3.max(json, d => xParser(d.Year + 1))]).range([0, width - 2 * wPadding]);
    const yScale = d3.scaleTime().domain(d3.extent(json, d => yParser(d.Time))).range([0, height - 2 * hPadding]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svg.append("g").attr("transform", `translate(${wPadding}, ${height - hPadding})`).call(xAxis).attr("id", "x-axis");
    svg.append("g").attr("transform", `translate(${wPadding}, ${hPadding})`).call(yAxis).attr("id", "y-axis");

    svg.selectAll("circle").data(json).enter().append("circle")
    .attr("cx", d => wPadding + xScale(xParser(d.Year)))
    .attr("cy", d => hPadding + yScale(yParser(d.Time)))
    .attr("r", 7).attr("class", "dot").attr("data-xvalue", d => xParser(d.Year)).attr("data-yvalue", d => yParser(d.Time))
    .attr("fill", d => {
      if (d.Doping === "") {
        return "cornflowerblue";
      } else {
        return "orange";
      }
    }).attr("stroke", "black").attr("stroke-width", "1").attr("transform-origin", d => `${wPadding + xScale(xParser(d.Year))} ${hPadding + yScale(yParser(d.Time))}`);

    
    const legend = svg.append("g").attr("id", "legend");
    const doping = legend.append("g").attr("id", "dop");
    const nodoping = legend.append("g").attr("id", "com");
    
    doping.append("text").text("Player who does doping").attr("x", 785).attr("y", 300);
    doping.append("rect").attr("width", 14).attr("height", 14).attr("x", 935).attr("y", 290).attr("stroke", "black").attr("fill", "orange");
    
    nodoping.append("text").text("Player who doesn't doping").attr("x", 771).attr("y", 323);
    doping.append("rect").attr("width", 14).attr("height", 14).attr("x", 935).attr("y", 313).attr("stroke", "black").attr("fill", "cornflowerblue");
    
    const tooltip = d3.select("main").append("div").attr("id", "tooltip");

    $("circle").hover((event) => {
      const cir = event.target;
      cir.remove();
      $("#legend").before(cir);
      tooltip.style("opacity", "1").style("z-index", 5).html(`Year: ${event.target.attributes["data-xvalue"].value.split(" ")[3]}</br>Time: ${event.target.attributes["data-yvalue"].value.split(" ")[4].match(/[0-9]+:[0-9]+$/)}`)
      .style("top", `calc(25vh + ${yScale(new Date(event.target.attributes["data-yvalue"].value)) - 40}px)`).style("left", `calc(5vw + (90vw - 1000px)/2 + ${wPadding + xScale(new Date(event.target.attributes["data-xvalue"].value)) + 30}px)`)
      .attr("data-year", `${event.target.attributes["data-xvalue"].value}`);
    }, () => {
      tooltip.style("opacity", "0").style("z-index", -1);
    })
  }
})