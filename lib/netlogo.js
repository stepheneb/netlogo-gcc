/*global browser:true */

var applet                  = document.getElementById("applet"),
    world_state             = document.getElementById("world-state"),
    globals_table           = document.getElementById("globals-table"),
    save_state_button       = document.getElementById("save-state-button"),
    restore_state_button    = document.getElementById("restore-state-button"),
    update_globals_button   = document.getElementById("update-globals-button"),
    run_button              = document.getElementById("run-button"),
    reset_button            = document.getElementById("reset-button"),
    watch_sunray_button     = document.getElementById("watch-sunray-button"),
    nl_obj_panel,           // org.nlogo.lite.Applet object
    nl_obj_workspace,       // org.nlogo.lite.LiteWorkspace
    nl_obj_world,           // org.nlogo.agent.World
    nl_obj_program,         // org.nlogo.api.Program
    nl_obj_state, 
    nl_obj_observer, 
    nl_obj_globals, 
    sw, 
    pw, 
    nlogo_elements,
    globals = [], i,
    data_array = [],
    graph;

window.onload=function() {
  disable_nlogo_elements();
  graph = simpleGraph().title("Temperature of Atmosphere")
      .xmax(300).ymax(20)
      .xLabel("Time")
      .yLabel("Temperature");

  d3.select("#chart").call(graph);

  //
  // NetLogo Applet Loading Handler
  //
  // Wait until the applet is loaded and initialized before enabling buttons
  // and creating JavaScript variables for Java objects in the applet.
  //
  applet.ready = false;
  applet.checked_more_than_once = false;
  window.setTimeout (function()  { isAppletReady(); }, 250);

  function isAppletReady() {
    try {
      applet.ready = applet.panel();
    } catch (e) {
      // Do nothing--we'll try again in the next timer interval.
    }
    if(applet.ready) {
      nl_setup_objects();
      update_globals_table();
      sw = new applet.Packages.java.io.StringWriter();
      pw = new applet.Packages.java.io.PrintWriter(sw);
      enable_nlogo_elements();
      if(applet.checked_more_than_once) {
        clearInterval(applet.checked_more_than_once);
        applet.checked_more_than_once = false;
      }
    } else {
      if(!applet.checked_more_than_once) {
        applet.checked_more_than_once = window.setInterval(function() { isAppletReady(); }, 250);
      }
    }
  }

  //
  // Create these JavaScript objects to provide access to the
  // corresponding Java objects in NetLogo.
  //
  function nl_setup_objects() {
    nl_obj_panel     = applet.panel();
    nl_obj_workspace = nl_obj_panel.workspace();
    nl_obj_world     = nl_obj_workspace.org$nlogo$lite$LiteWorkspace$$world;
    nl_obj_program   = nl_obj_world.program();
    nl_obj_observer  = nl_obj_world.observer();
    nl_obj_globals   = nl_obj_program.globals();
  }
  //
  // NetLogo command interface
  //
  function nl_cmd_start() {
    nl_obj_panel.commandLater("set done false while [not done] [ execute ]");
  }

  function nl_cmd_stop() {
    nl_obj_panel.commandLater("set done true");
  }

  function nl_cmd_execute(cmd) {
    nl_obj_panel.commandLater(cmd);
  }

  function nl_cmd_save_state() {
    nl_obj_world.exportWorld(pw, true);
    nl_obj_state = sw.toString();
  }

  function nl_cmd_restore_state() {
    if (nl_obj_state) {
      var sr = new applet.Packages.java.io.StringReader(nl_obj_state);
      nl_obj_workspace.importWorld(sr);
      nl_obj_panel.commandLater("display");
    }
  }

  function startNLDataPoller() {
    applet.data_poller = window.setInterval(function() { nlDataPoller(); }, 200);
  }

  function nlDataPoller() {
    data_array.push(nl_obj_observer.getVariable(3));
    graph.set_data(data_array);
  }

  //
  // button handlers
  //
  run_button.onclick = function() {
    if  (run_button.textContent == "Run") {
      nl_cmd_start();
      startNLDataPoller();
      run_button.textContent = "Stop";
    } else {
      nl_obj_panel.commandLater("set done true");
      if (applet.data_poller) {
        clearInterval(applet.data_poller);
        applet.data_poller = false;
      }
      run_button.textContent = "Run";
    }
  };

  reset_button.onclick = function() {
    nl_obj_panel.commandLater("set done true");
    run_button.textContent = "Run";
    if (applet.data_poller) {
      clearInterval(applet.data_poller);
      applet.data_poller = false;
    }
    data_array.length = 0;
    graph.set_data(data_array);
    nl_obj_panel.commandLater("startup");
    update_globals_table();
  };

  watch_sunray_button.onclick = function() {
    nl_cmd_execute("watch one-of sunrays with [ycor > (max-pycor / 2 ) and heading > 90 ]");
  };

  save_state_button.onclick = function() {
    nl_cmd_save_state();
    world_state.textContent = nl_obj_state;
  };

  restore_state_button.onclick = function() {
    nl_cmd_restore_state();
    update_globals_table();
  };

  update_globals_button.onclick = function() {
    update_globals_table();
  };

  //
  // view helper
  //
  function update_globals_table() {
    var  i, tr, th, td;
    if (globals_table.hasChildNodes()) {
      while (globals_table.childNodes.length >= 1) {
        globals_table.removeChild(globals_table.firstChild);
      }
    }
    for(i = 0; i < nl_obj_globals.size(); i++) {
      globals[i] = nl_obj_globals.get(i);
      tr = document.createElement('tr');
      td = document.createElement('td');
      td.textContent = globals[i];
      tr.appendChild(td);
      td = document.createElement('td');
      td.classList.add("left");
      td.textContent = nl_obj_observer.getVariable(i);
      tr.appendChild(td);
      globals_table.appendChild(tr);
    }
  }

  //
  // add the css class "inactive" to all dom elements that include the class "nlogo"
  //
  function disable_nlogo_elements() {
    nlogo_elements = document.getElementsByClassName("nlogo");
    for (i=0; i < nlogo_elements.length; i++) {
      nlogo_elements[i].classList.add("inactive");
    }
  }

  //
  // add the css class "active" to all dom elements that include the class "nlogo"
  //
  function enable_nlogo_elements() {
    nlogo_elements = document.getElementsByClassName("nlogo");
    for (i=0; i < nlogo_elements.length; i++) {
      nlogo_elements[i].classList.remove("inactive");
      nlogo_elements[i].classList.add("active");
    }
  }
};
