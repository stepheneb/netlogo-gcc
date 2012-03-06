var applet                = document.getElementById("applet"),
    world_state           = document.getElementById("world-state"),
    globals_table         = document.getElementById("globals-table"),
    save_state_button     = document.getElementById("save-state-button"),
    restore_state_button  = document.getElementById("restore-state-button"),
    update_globals_button = document.getElementById("update-globals-button"),
    nl_panel, nl_workspace, nl_world, nl_state, nl_program, nl_observer, nl_globals, sw, pw, 
    nlogo_elements,
    globals = [], i,
    graph;


window.onload=function() {
  disable_nlogo_elements();
  graph = simpleGraph().title("Temperature of Atmosphere").xmax(60).ymax(20).xLabel("Time").yLabel("Temperature");
  d3.select("#chart").call(graph);

  // Wait until the applet is loaded and initialized before enabling buttons
  // and creating JavaScript variables for Java objects in the applet.
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
      nl_panel = applet.panel();
      nl_workspace = nl_panel.workspace();
      nl_world = nl_workspace.org$nlogo$lite$LiteWorkspace$$world;
      nl_program = nl_world.program();
      nl_observer = nl_world.observer();
      nl_globals = nl_program.globals();
      update_globals();
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

  save_state_button.onclick = function() {
    nl_world.exportWorld(pw, true);
    nl_state = sw.toString();
    world_state.textContent = nl_state;
  };

  restore_state_button.onclick = function() {
    if (nl_state) {
      var sr = new applet.Packages.java.io.StringReader(nl_state);
      nl_workspace.importWorld(sr);
      nl_panel.repaint();
      applet.repaint();
    }
  };

  // restore_state_button.onclick = function() {
  //   if (nl_state) {
  //     var errorHandler = applet.Packages.org.nlogo.api.ImportErrorHandler;
  //     var importerUser = applet.Packages.org.nlogo.api.ImporterUser;
  //     var bufferedReader = applet.Packages.java.io.BufferedReader;
  //     var sr = new applet.Packages.java.io.StringReader(nl_state);
  //     nl_world.importWorld(errorHandler, importerUser, sr, bufferedReader);
  //     nl_panel().repaint();
  //   }
  // };

  update_globals_button.onclick = function() {
    update_globals();
  };

  function update_globals() {
    var  i, tr, th, td;
    if (globals_table.hasChildNodes()) {
      while (globals_table.childNodes.length >= 1) {
        globals_table.removeChild(globals_table.firstChild);
      }
    }
    for(i = 0; i < nl_globals.size(); i++) {
      globals[i] = nl_globals.get(i);
      tr = document.createElement('tr');
      td = document.createElement('td');
      td.textContent = globals[i];
      tr.appendChild(td);
      td = document.createElement('td');
      td.classList.add("left");
      td.textContent = nl_observer.getVariable(i);
      tr.appendChild(td);
      globals_table.appendChild(tr);
    }
  }

  function disable_nlogo_elements() {
    nlogo_elements = document.getElementsByClassName("nlogo");
    for (i=0; i < nlogo_elements.length; i++) {
      nlogo_elements[i].classList.add("inactive");
    }
  }

  function enable_nlogo_elements() {
    nlogo_elements = document.getElementsByClassName("nlogo");
    for (i=0; i < nlogo_elements.length; i++) {
      nlogo_elements[i].classList.remove("inactive");
      nlogo_elements[i].classList.add("active");
    }
  }
};
