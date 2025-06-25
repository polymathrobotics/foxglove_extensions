import { PanelExtensionContext } from "@foxglove/extension";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const UUID_MIN = 10000;
const UUID_MAX = 65535;

// Service definitions --------
type ModifyRouteNodeRequest = {
  operation: number;
  map_id: number;
  route_graph_name: string;
  node: {
    node_id: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
    node_name: string;
  }
}

type ModifyRouteNodeResponse = {
  success: boolean;
  message: string;
  node_id: number;
}

type ModifyRouteEdgeRequest = {
  operation: number;
  map_id: number;
  route_graph_name: string;
  edge: {
    from_node_id: number;
    to_node_id: number;
    edge_id: number;
    edge_cost: number;
  }
}

type ModifyRouteEdgeResponse = {
  success: boolean;
  message: string;
  edge_id: number;
}

type ManageRouteGraphRequest = {
  operation: number;
  map_id: number;
  route_graph_name: string;
}

type ManageRouteGraphResponse = {
  success: boolean;
  message: string;
}

type ListRouteGraphsRequest = {
  map_id: number;
}

type ListRouteGraphsResponse = {
  success: boolean;
  route_graphs_list: string[];
  message: string;
}
// ----------------------------

// Panel method
function RouteManagerPanel({ context }: { context: PanelExtensionContext }) {
  // Common
  const [error, setError] = useState<string>();
  const map_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "map_id" in context.initialState
      ? String((context.initialState as any).map_id)
      : "";
  const [mapIDInputValue, setMapIDInputValue] = useState<string>(map_id_restored);
  const [hoveringInputMapID, setHoveringInputMapID] = useState(false);
  const route_graph_name_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "route_graph_name" in context.initialState
      ? String((context.initialState as any).route_graph_name)
      : "";
  const [routeGraphNameInputValue, setRouteGraphNameInputValue] = useState<string>(route_graph_name_restored);
  const [hoveringInputRouteGraphName, setHoveringInputRouteGraphName] = useState(false);

  // Route Node Management --------------

  // For adding route node
  const [modify_route_node_response, setModifyRouteNodeResponse] = useState<ModifyRouteNodeResponse | null>(null);
  const add_route_node_x_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_node_x" in context.initialState
      ? String((context.initialState as any).add_route_node_x)
      : "";
  const [addRouteNodeXInputValue, setAddRouteNodeXInputValue] = useState<string>(add_route_node_x_restored);
  const [hoveringInputAddRouteNodeX, setHoveringInputAddRouteNodeX] = useState(false);
  const add_route_node_y_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_node_y" in context.initialState
      ? String((context.initialState as any).add_route_node_y)
      : "";
  const [addRouteNodeYInputValue, setAddRouteNodeYInputValue] = useState<string>(add_route_node_y_restored);
  const [hoveringInputAddRouteNodeY, setHoveringInputAddRouteNodeY] = useState(false);
  const add_route_node_name_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_node_name" in context.initialState
      ? String((context.initialState as any).add_route_node_name)
      : "";
  const [addRouteNodeNameInputValue, setAddRouteNodeNameInputValue] = useState<string>(add_route_node_name_restored);
  const [hoveringInputAddRouteNodeName, setHoveringInputAddRouteNodeName] = useState(false);
  const [addRouteNodeHoveringButton, setAddRouteNodeHoveringButton] = useState(false);
  const [loadingAddRouteNodeButton, setLoadingAddRouteNodeButton] = useState(false);
 
  // For deleting route node
  const delete_route_node_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "delete_route_node_id" in context.initialState
      ? String((context.initialState as any).delete_route_node_id)
      : "";
  const [deleteRouteNodeIDInputValue, setDeleteRouteNodeIDInputValue] = useState<string>(delete_route_node_id_restored);
  const [hoveringInputDeleteRouteNodeID, setHoveringInputDeleteRouteNodeID] = useState(false);
  const [deleteRouteNodeHoveringButton, setDeleteRouteNodeHoveringButton] = useState(false);
  const [loadingDeleteRouteNodeButton, setLoadingDeleteRouteNodeButton] = useState(false);


  // For editing route node
  const edit_route_node_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "edit_route_node_id" in context.initialState
      ? String((context.initialState as any).edit_route_node_id)
      : "";
  const [editRouteNodeIDInputValue, setEditRouteNodeIDInputValue] = useState<string>(edit_route_node_id_restored);
  const [hoveringInputEditRouteNodeID, setHoveringInputEditRouteNodeID] = useState(false);
  const edit_route_node_x_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "edit_route_node_x" in context.initialState
      ? String((context.initialState as any).edit_route_node_x)
      : "";
  const [editRouteNodeXInputValue, setEditRouteNodeXInputValue] = useState<string>(edit_route_node_x_restored);
  const [hoveringInputEditRouteNodeX, setHoveringInputEditRouteNodeX] = useState(false);
  const edit_route_node_y_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "edit_route_node_y" in context.initialState
      ? String((context.initialState as any).edit_route_node_y)
      : "";
  const [editRouteNodeYInputValue, setEditRouteNodeYInputValue] = useState<string>(edit_route_node_y_restored);
  const [hoveringInputEditRouteNodeY, setHoveringInputEditRouteNodeY] = useState(false);
  const edit_route_node_name_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "edit_route_node_name" in context.initialState
      ? String((context.initialState as any).edit_route_node_name)
      : "";
  const [editRouteNodeNameInputValue, setEditRouteNodeNameInputValue] = useState<string>(edit_route_node_name_restored);
  const [hoveringInputEditRouteNodeName, setHoveringInputEditRouteNodeName] = useState(false);
  const [editRouteNodeHoveringButton, setEditRouteNodeHoveringButton] = useState(false);
  const [loadingEditRouteNodeButton, setLoadingEditRouteNodeButton] = useState(false);

  // ------------------------------------
  // Route Edge Management --------------

  // Adding route edge 
  const [modify_route_edge_response, setModifyRouteEdgeResponse] = useState<ModifyRouteEdgeResponse | null>(null);
  const add_route_edge_from_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_edge_from_id" in context.initialState
      ? String((context.initialState as any).add_route_edge_from_id)
      : "";
  const [addRouteEdgeFromIDInputValue, setAddRouteEdgeFromIDInputValue] = useState<string>(add_route_edge_from_id_restored);
  const [hoveringInputAddRouteEdgeFromID, setHoveringInputAddRouteEdgeFromID] = useState(false);
  const add_route_edge_to_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_edge_to_id" in context.initialState
      ? String((context.initialState as any).add_route_edge_to_id)
      : "";
  const [addRouteEdgeToIDInputValue, setAddRouteEdgeToIDInputValue] = useState<string>(add_route_edge_to_id_restored);
  const [hoveringInputAddRouteEdgeToID, setHoveringInputAddRouteEdgeToID] = useState(false);
  const add_route_edge_edge_cost_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "add_route_edge_edge_cost" in context.initialState
      ? String((context.initialState as any).add_route_edge_edge_cost)
      : "";
  const [addRouteEdgeEdgeCostInputValue, setAddRouteEdgeEdgeCostInputValue] = useState<string>(add_route_edge_edge_cost_restored);
  const [hoveringInputAddRouteEdgeEdgeCost, setHoveringInputAddRouteEdgeEdgeCost] = useState(false);
  const [addRouteEdgeHoveringButton, setAddRouteEdgeHoveringButton] = useState(false);
  const [loadingAddRouteEdgeButton, setLoadingAddRouteEdgeButton] = useState(false);

  // Deleting route edge
  const delete_route_edge_edge_id_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "delete_route_edge_edge_id" in context.initialState
      ? String((context.initialState as any).delete_route_edge_edge_id)
      : "";
  const [deleteRouteEdgeEdgeIDInputValue, setDeleteRouteEdgeEdgeIDInputValue] = useState<string>(delete_route_edge_edge_id_restored);
  const [hoveringInputDeleteRouteEdgeEdgeID, setHoveringInputDeleteRouteEdgeEdgeID] = useState(false);
  const [deleteRouteEdgeHoveringButton, setDeleteRouteEdgeHoveringButton] = useState(false);
  const [loadingDeleteRouteEdgeButton, setLoadingDeleteRouteEdgeButton] = useState(false);
  // ------------------------------------
  // Route Graph Management --------------
  const [manage_route_graph_response, setManageRouteGraphResponse] = useState<ManageRouteGraphResponse | null>(null);

  // Deleting route graph
  const [deleteRouteGraphHoveringButton, setDeleteRouteGraphHoveringButton] = useState(false);
  const [loadingDeleteRouteGraphButton, setLoadingDeleteRouteGraphButton] = useState(false);

  // Loading route graph
  const [loadRouteGraphHoveringButton, setLoadRouteGraphHoveringButton] = useState(false);
  const [loadingLoadRouteGraphButton, setLoadingLoadRouteGraphButton] = useState(false);

  // Fetching/Visualizing route graph
  const [fetchRouteGraphHoveringButton, setFetchRouteGraphHoveringButton] = useState(false);
  const [loadingFetchRouteGraphButton, setLoadingFetchRouteGraphButton] = useState(false);

  // Listing route graphs
  const [listRouteGraphsHoveringButton, setListRouteGraphsHoveringButton] = useState(false);
  const [loadingListRouteGraphsButton, setLoadingListRouteGraphsButton] = useState(false);
  const [list_route_graphs_response, setListRouteGraphsResponse] = useState<ListRouteGraphsResponse | null>(null);
  // ------------------------------------

  // Service calls ------------------
  const callAddRouteNode = async () => {
    setLoadingAddRouteNodeButton(true);
    setModifyRouteNodeResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingAddRouteNodeButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingAddRouteNodeButton(false);
      return;
    }
    const parsed_add_route_node_x_val = parseInt(addRouteNodeXInputValue, 10);
    if (isNaN(parsed_add_route_node_x_val)) {
      setError("Please enter a valid pose x value");
      setLoadingAddRouteNodeButton(false);
      return;
    }
    const parsed_add_route_node_y_val = parseInt(addRouteNodeYInputValue, 10);
    if (isNaN(parsed_add_route_node_y_val)) {
      setError("Please enter a valid pose y value");
      setLoadingAddRouteNodeButton(false);
      return;
    }
    const parsed_add_route_node_name_val = addRouteNodeNameInputValue.trim();

    // Fill in request message
    const request: ModifyRouteNodeRequest = {
      operation: 0,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
      node: {
        node_id: 0,
        position: {
          x: parsed_add_route_node_x_val, 
          y: parsed_add_route_node_y_val, 
          z: 0
        },
        node_name: parsed_add_route_node_name_val
      }
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/modify_route_node", request);
      const res = raw as ModifyRouteNodeResponse;
      if(res){
        setModifyRouteNodeResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
      context.saveState({ add_route_node_x: parsed_add_route_node_x_val });
      context.saveState({ add_route_node_y: parsed_add_route_node_y_val });
      context.saveState({ add_route_node_name: parsed_add_route_node_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingAddRouteNodeButton(false);
    }
  };

  const callDeleteRouteNode = async () => {
    setLoadingDeleteRouteNodeButton(true);
    setModifyRouteNodeResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingDeleteRouteNodeButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingDeleteRouteNodeButton(false);
      return;
    }
    const parsed_delete_route_node_id_val = parseInt(deleteRouteNodeIDInputValue, 10);
    if (isNaN(parsed_delete_route_node_id_val) || parsed_delete_route_node_id_val < UUID_MIN || parsed_delete_route_node_id_val > UUID_MAX) {
      setError("Please enter a valid node ID value");
      setLoadingDeleteRouteNodeButton(false);
      return;
    }

    // Fill in request message
    const request: ModifyRouteNodeRequest = {
      operation: 1,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
      node: {
        node_id: parsed_delete_route_node_id_val,
        position: {
          x: 0, y: 0, z: 0
        },
        node_name: ""
      }
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/modify_route_node", request);
      const res = raw as ModifyRouteNodeResponse;
      if(res){
        setModifyRouteNodeResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
      context.saveState({ delete_route_node_id: parsed_delete_route_node_id_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingDeleteRouteNodeButton(false);
    }
  };

  const callEditRouteNode = async () => {
    setLoadingEditRouteNodeButton(true);
    setModifyRouteNodeResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingEditRouteNodeButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingEditRouteNodeButton(false);
      return;
    }
    const parsed_edit_route_node_id_val = parseInt(editRouteNodeIDInputValue, 10);
    if (isNaN(parsed_edit_route_node_id_val) || parsed_edit_route_node_id_val < UUID_MIN || parsed_edit_route_node_id_val > UUID_MAX) {
      setError("Please enter a valid node ID value");
      setLoadingEditRouteNodeButton(false);
      return;
    }
    const parsed_edit_route_node_x_val = parseInt(editRouteNodeXInputValue, 10);
    if (isNaN(parsed_edit_route_node_x_val)) {
      setError("Please enter a valid pose x value");
      setLoadingEditRouteNodeButton(false);
      return;
    }
    const parsed_edit_route_node_y_val = parseInt(editRouteNodeYInputValue, 10);
    if (isNaN(parsed_edit_route_node_y_val)) {
      setError("Please enter a valid pose y value");
      setLoadingEditRouteNodeButton(false);
      return;
    }
    const parsed_edit_route_node_name_val = editRouteNodeNameInputValue.trim();

    // Fill in request message
    const request: ModifyRouteNodeRequest = {
      operation: 2,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
      node: {
        node_id: parsed_edit_route_node_id_val,
        position: {
          x: parsed_edit_route_node_x_val, 
          y: parsed_edit_route_node_y_val, 
          z: 0
        },
        node_name: parsed_edit_route_node_name_val
      }
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/modify_route_node", request);
      const res = raw as ModifyRouteNodeResponse;
      if(res){
        setModifyRouteNodeResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
      context.saveState({ edit_route_node_id: parsed_edit_route_node_id_val });
      context.saveState({ edit_route_node_x: parsed_edit_route_node_x_val });
      context.saveState({ edit_route_node_y: parsed_edit_route_node_y_val });
      context.saveState({ edit_route_node_name: parsed_edit_route_node_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingEditRouteNodeButton(false);
    }
  };

  const callAddRouteEdge = async () => {
    setLoadingAddRouteEdgeButton(true);
    setModifyRouteEdgeResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingAddRouteEdgeButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingAddRouteEdgeButton(false);
      return;
    }
    const parsed_add_route_edge_from_id_val = parseInt(addRouteEdgeFromIDInputValue, 10);
    if (isNaN(parsed_add_route_edge_from_id_val) || parsed_add_route_edge_from_id_val < UUID_MIN || parsed_add_route_edge_from_id_val > UUID_MAX) {
      setError("Please enter a valid 'from ID' value");
      setLoadingAddRouteEdgeButton(false);
      return;
    }
    const parsed_add_route_edge_to_id_val = parseInt(addRouteEdgeToIDInputValue, 10);
    if (isNaN(parsed_add_route_edge_to_id_val) || parsed_add_route_edge_to_id_val < UUID_MIN || parsed_add_route_edge_to_id_val > UUID_MAX) {
      setError("Please enter a valid 'to ID' value");
      setLoadingAddRouteEdgeButton(false);
      return;
    }
    const parsed_add_route_edge_edge_cost_val = parseInt(addRouteEdgeEdgeCostInputValue, 10);
    if (isNaN(parsed_add_route_edge_edge_cost_val) || parsed_add_route_edge_edge_cost_val < 0) {
      setError("Please enter a valid edge cost");
      setLoadingAddRouteEdgeButton(false);
      return;
    }

    // Fill in request message
    const request: ModifyRouteEdgeRequest = {
      operation: 0,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
      edge: {
        edge_id: 0,
        from_node_id: parsed_add_route_edge_from_id_val,
        to_node_id: parsed_add_route_edge_to_id_val,
        edge_cost: parsed_add_route_edge_edge_cost_val
      }
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/modify_route_edge", request);
      const res = raw as ModifyRouteEdgeResponse;
      if(res){
        setModifyRouteEdgeResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
      context.saveState({ add_route_edge_from_id: parsed_add_route_edge_from_id_val });
      context.saveState({ add_route_edge_to_id: parsed_add_route_edge_to_id_val });
      context.saveState({ add_route_edge_edge_cost: parsed_add_route_edge_edge_cost_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingAddRouteEdgeButton(false);
    }
  };

  const callDeleteRouteEdge = async () => {
    setLoadingDeleteRouteEdgeButton(true);
    setModifyRouteEdgeResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingDeleteRouteEdgeButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingDeleteRouteEdgeButton(false);
      return;
    }
    const parsed_delete_route_edge_edge_id_val = parseInt(deleteRouteEdgeEdgeIDInputValue, 10);
    if (isNaN(parsed_delete_route_edge_edge_id_val) || parsed_delete_route_edge_edge_id_val < UUID_MIN || parsed_delete_route_edge_edge_id_val > UUID_MAX) {
      setError("Please enter a valid 'edge ID' value");
      setLoadingDeleteRouteEdgeButton(false);
      return;
    }

    // Fill in request message
    const request: ModifyRouteEdgeRequest = {
      operation: 1,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
      edge: {
        edge_id: parsed_delete_route_edge_edge_id_val,
        from_node_id: 0,
        to_node_id: 0,
        edge_cost: 0
      }
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/modify_route_edge", request);
      const res = raw as ModifyRouteEdgeResponse;
      if(res){
        setModifyRouteEdgeResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
      context.saveState({ delete_route_edge_edge_id: parsed_delete_route_edge_edge_id_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingDeleteRouteEdgeButton(false);
    }
  };

  const callLoadRouteGraph = async () => {
    setLoadingLoadRouteGraphButton(true);
    setManageRouteGraphResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingLoadRouteGraphButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingLoadRouteGraphButton(false);
      return;
    }

    // Fill in request message
    const request: ManageRouteGraphRequest = {
      operation: 2,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/manage_route_graph", request);
      const res = raw as ManageRouteGraphResponse;
      if(res){
        setManageRouteGraphResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingLoadRouteGraphButton(false);
    }
  };

  const callDeleteRouteGraph = async () => {
    setLoadingDeleteRouteGraphButton(true);
    setManageRouteGraphResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingDeleteRouteGraphButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingDeleteRouteGraphButton(false);
      return;
    }

    // Fill in request message
    const request: ManageRouteGraphRequest = {
      operation: 3,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/manage_route_graph", request);
      const res = raw as ManageRouteGraphResponse;
      if(res){
        setManageRouteGraphResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingDeleteRouteGraphButton(false);
    }
  };

  const callFetchRouteGraph = async () => {
    setLoadingFetchRouteGraphButton(true);
    setManageRouteGraphResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingFetchRouteGraphButton(false);
      return;
    }
    const parsed_route_graph_name_val = routeGraphNameInputValue.trim();
    if (!parsed_route_graph_name_val) {
      setError("Please enter a valid route graph name");
      setLoadingFetchRouteGraphButton(false);
      return;
    }

    // Fill in request message
    const request: ManageRouteGraphRequest = {
      operation: 0,
      map_id: parsed_map_id_val,
      route_graph_name: parsed_route_graph_name_val,
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/manage_route_graph", request);
      const res = raw as ManageRouteGraphResponse;
      if(res){
        res.message = "";
        setManageRouteGraphResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
      context.saveState({ route_graph_name: parsed_route_graph_name_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingFetchRouteGraphButton(false);
    }
  };

  const callListRouteGraphs = async () => {
    setLoadingListRouteGraphsButton(true);
    setListRouteGraphsResponse(null);
    setError(undefined);

    // Parse & guard for input
    const parsed_map_id_val = parseInt(mapIDInputValue, 10);
    if (isNaN(parsed_map_id_val) || parsed_map_id_val < UUID_MIN || parsed_map_id_val > UUID_MAX) {
      setError("Please enter a valid map ID value");
      setLoadingListRouteGraphsButton(false);
      return;
    }

    // Fill in request message
    const request: ListRouteGraphsRequest = {
      map_id: parsed_map_id_val
    }

    // Call service
    try {
      const raw = await context.callService?.("/route_manager/list_route_graphs", request);
      const res = raw as ListRouteGraphsResponse;
      if(res){
        setListRouteGraphsResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ map_id: parsed_map_id_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingListRouteGraphsButton(false);
    }
  };
  
  // ------------------------------------

  // Styles ------------------
  const panelStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 12,
    padding: 24,
    gridAutoRows: "minmax(0, auto)",

    maxHeight: "100%",
    overflowY: "auto",
  };
  const titleStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    fontSize: 24,
    maxWidth: "100%",
    fontWeight: "bold",
    gridColumn: "1 / span 4",
  };
  const descriptionStyle: React.CSSProperties = {
    overflow: "hidden", 
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    padding: "0px 2px",
    gridColumn: "1 / span 4",
  };
  const commonDataCellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderRadius: 4,
    resize: "vertical",
    paddingBottom: "10px",
  };
  const labelCommonDataTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    padding: "10px",
    fontSize: 11,
  };
  const inputCommonDataStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",
    alignSelf: "center",

    maxWidth: "70%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputMapIDHoverStyle: React.CSSProperties = hoveringInputMapID ? {
    borderColor: "#fff",
  } : {};
  const inputRouteGraphNameHoverStyle: React.CSSProperties = hoveringInputRouteGraphName ? {
    borderColor: "#fff",
  } : {};

  
  const routeNodeBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gridColumn: "1 / span 4",
    background: "var(--foxglove-panel-surface)",
    borderRadius: 4,
    resize: "vertical",
    maxWidth: "100%",
  }
  const routeEdgeBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gridColumn: "1 / span 4",
    background: "var(--foxglove-panel-surface)",
    borderRadius: 4,
    resize: "vertical",
    maxWidth: "100%",
  }
  const labelTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "100%",
    paddingLeft: "5px",
    paddingBottom: "5px",
  };
  const inputDataStyle: React.CSSProperties = {
    flex: 1, 
    border: "1px solid #ccc",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 1.4,
    borderRadius: 4,
    background: "var(--foxglove-panel-surface)",
    color: "var(--foxglove-text-primary)",
    resize: "vertical",
    outline: "none",
    textAlign: "center",
    alignSelf: "stretch",
    marginBottom: 4,

    maxWidth: "100%",
    overflow: "hidden", 
    textOverflow: "ellipsis",
  };
  const inputAddRouteNodeXHoverStyle: React.CSSProperties = hoveringInputAddRouteNodeX ? {
    borderColor: "#fff",
  } : {};
  const inputAddRouteNodeYHoverStyle: React.CSSProperties = hoveringInputAddRouteNodeY ? {
    borderColor: "#fff",
  } : {};
  const inputAddRouteNodeNameHoverStyle: React.CSSProperties = hoveringInputAddRouteNodeName ? {
    borderColor: "#fff",
  } : {};
  const inputDeleteRouteNodeIDHoverStyle: React.CSSProperties = hoveringInputDeleteRouteNodeID ? {
    borderColor: "#fff",
  } : {};
  const inputEditRouteNodeIDHoverStyle: React.CSSProperties = hoveringInputEditRouteNodeID ? {
    borderColor: "#fff",
  } : {};
  const inputEditRouteNodeXHoverStyle: React.CSSProperties = hoveringInputEditRouteNodeX ? {
    borderColor: "#fff",
  } : {};
  const inputEditRouteNodeYHoverStyle: React.CSSProperties = hoveringInputEditRouteNodeY ? {
    borderColor: "#fff",
  } : {};
  const inputEditRouteNodeNameHoverStyle: React.CSSProperties = hoveringInputEditRouteNodeName ? {
    borderColor: "#fff",
  } : {};
  const inputAddRouteEdgeFromIDHoverStyle: React.CSSProperties = hoveringInputAddRouteEdgeFromID ? {
    borderColor: "#fff",
  } : {};
  const inputAddRouteEdgeToIDHoverStyle: React.CSSProperties = hoveringInputAddRouteEdgeToID ? {
    borderColor: "#fff",
  } : {};
  const inputAddRouteEdgeEdgeCostHoverStyle: React.CSSProperties = hoveringInputAddRouteEdgeEdgeCost ? {
    borderColor: "#fff",
  } : {};
  const inputDeleteRouteEdgeEdgeIDHoverStyle: React.CSSProperties = hoveringInputDeleteRouteEdgeEdgeID ? {
    borderColor: "#fff",
  } : {};

  const addButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#00b409",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const addRouteNodeButtonHoverStyle: React.CSSProperties = addRouteNodeHoveringButton
    ? { backgroundColor: "#018c08" } : {};
  const addRouteNodeButtonLoadingStyle: React.CSSProperties = loadingAddRouteNodeButton
    ? { backgroundColor: "gray" } : {};
  const addRouteEdgeButtonHoverStyle: React.CSSProperties = addRouteEdgeHoveringButton
    ? { backgroundColor: "#018c08" } : {};
  const addRouteEdgeButtonLoadingStyle: React.CSSProperties = loadingAddRouteEdgeButton
    ? { backgroundColor: "gray" } : {};

  const deleteButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 25px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#dd0000",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const deleteRouteNodeButtonHoverStyle: React.CSSProperties = deleteRouteNodeHoveringButton
    ? { backgroundColor: "#ba0000" } : {};
  const deleteRouteNodeButtonLoadingStyle: React.CSSProperties = loadingDeleteRouteNodeButton
    ? { backgroundColor: "gray" } : {};
  const deleteRouteEdgeButtonHoverStyle: React.CSSProperties = deleteRouteEdgeHoveringButton
    ? { backgroundColor: "#ba0000" } : {};
  const deleteRouteEdgeButtonLoadingStyle: React.CSSProperties = loadingDeleteRouteEdgeButton
    ? { backgroundColor: "gray" } : {};
  const deleteRouteGraphButtonHoverStyle: React.CSSProperties = deleteRouteGraphHoveringButton
    ? { backgroundColor: "#ba0000" } : {};
  const deleteRouteGraphButtonLoadingStyle: React.CSSProperties = loadingDeleteRouteGraphButton
    ? { backgroundColor: "gray" } : {};

  const editButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const editButtonHoverStyle: React.CSSProperties = editRouteNodeHoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  const editRouteNodeButtonLoadingStyle: React.CSSProperties = loadingEditRouteNodeButton
    ? { backgroundColor: "gray" } : {};
  
  const loadButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "80%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const loadButtonHoverStyle: React.CSSProperties = loadRouteGraphHoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  const loadRouteGraphButtonLoadingStyle: React.CSSProperties = loadingLoadRouteGraphButton
    ? { backgroundColor: "gray" } : {};
  
  const fetchButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "80%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const fetchButtonHoverStyle: React.CSSProperties = fetchRouteGraphHoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  const fetchRouteGraphButtonLoadingStyle: React.CSSProperties = loadingFetchRouteGraphButton
    ? { backgroundColor: "gray" } : {};
  
  const listButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "80%",
    whiteSpace: "nowrap",
    padding: "10px 30px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
  };
  const listButtonHoverStyle: React.CSSProperties = listRouteGraphsHoveringButton
    ? { backgroundColor: "#006bb3" } : {};
  const listRouteGraphsButtonLoadingStyle: React.CSSProperties = loadingListRouteGraphsButton
    ? { backgroundColor: "gray" } : {};

  const responseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    borderRadius: 4,
    overflow: "hidden", 
    textOverflow: "ellipsis",
    maxWidth: "90%",
    padding: "20px",
    backgroundColor: "#1f1f26",
  }

  const dividerStyle: React.CSSProperties = {
    display: "flex",
    gridColumn: "1 / -1",           // span from column 1 to the last
    width: "20%",                  // fill that span
    border: "none",                 // remove default
    borderTop: "1px solid #2e2e2e",    // your divider line
    margin: "5px 0",
    placeSelf: "center",
  }

  // -------------------------

  // Return
  return (
    <div style={panelStyle}>
      
      <label style={titleStyle}>Route Manager</label>

      <div style={descriptionStyle}>
        Use this panel to interface with Route Manager node to manage route information. 
        All requests below require a Map ID and a Route graph name. 
      </div>
      <div style={descriptionStyle}>
        Input Instructions:
        <ul>
          <li><strong>ID:</strong> All IDs should have a value between 10000-65535</li>
          <li><strong>Names:</strong> All names should have only alphanumeric and underscore ('_') characters. Names should not start with an underscore</li>
          <li><strong>Cost:</strong> Edge cost should be a non-negative number</li>
        </ul>
      </div>

      <div style={{...commonDataCellStyle, border: "1px solid #ccc",}}>
        <label style={{
          ...labelCommonDataTextStyle, 
          fontWeight: "bold",
          alignSelf: "center",
          fontSize: 13,
           }}>Common Data</label>
        <label style={labelCommonDataTextStyle}>Map ID:</label>
        <input
          id="map-id"
          type="number"
          value={mapIDInputValue}
          onChange={e => setMapIDInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputMapID(true)}
          onMouseLeave={() => setHoveringInputMapID(false)}
          style={{ ...inputCommonDataStyle , ...inputMapIDHoverStyle }}
        />
        <label style={labelCommonDataTextStyle}>Route graph name:</label>
        <input
          id="route-graph-name"
          type="text"
          value={routeGraphNameInputValue}
          onChange={e => setRouteGraphNameInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputRouteGraphName(true)}
          onMouseLeave={() => setHoveringInputRouteGraphName(false)}
          style={{ ...inputCommonDataStyle , ...inputRouteGraphNameHoverStyle }}
        />
      </div>

      {error && (
        <div style={{
          ...commonDataCellStyle, 
          gridColumn: "4 / span 1",
          }}>
          <label style={{
            ...labelTextStyle, 
            fontWeight: "bold",
            color: "crimson", 
            paddingBottom: "0px",
            }}>Error</label>
          <pre style={{ ...responseStyle }}>
            <div style={{ 
              color: "crimson",
              gridColumn: "4 / span 1", 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "wrap",
              }}>{error}</div>
          </pre>
        </div>
      )}

      <hr style={dividerStyle}/>

      <div style={routeNodeBlockStyle}>
        <div style={{...panelStyle, padding: 0,}}>
          <label style={{
            paddingLeft: "5px",
            color: "#3f3f3f",
            fontSize: 10,
            fontWeight: "bold",
            gridColumn: "1 / span 4",
            }}>NODE MANAGEMENT</label>
        </div>
      </div>
        
      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "1 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Add Node</label>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingLeft: "15px",
            paddingRight: "22px",
            alignSelf: "center",
            }}>x:</label>
          <input
            id="add_route_node_x"
            type="number"
            value={addRouteNodeXInputValue}
            onChange={e => setAddRouteNodeXInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteNodeX(true)}
            onMouseLeave={() => setHoveringInputAddRouteNodeX(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteNodeXHoverStyle, 
              width: "70%",
            }}
          />
        </div>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle,
            paddingLeft: "15px",
            paddingRight: "22px",
            alignSelf: "center",
            }}>y:</label>
          <input
            id="add_route_node_y"
            type="number"
            value={addRouteNodeYInputValue}
            onChange={e => setAddRouteNodeYInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteNodeY(true)}
            onMouseLeave={() => setHoveringInputAddRouteNodeY(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteNodeYHoverStyle, 
              width: "70%",
            }}
          />
        </div>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingRight: "5px",
            alignSelf: "center",
            }}>Name:</label>
          <input
            id="add_route_node_name"
            type="text"
            value={addRouteNodeNameInputValue}
            onChange={e => setAddRouteNodeNameInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteNodeName(true)}
            onMouseLeave={() => setHoveringInputAddRouteNodeName(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteNodeNameHoverStyle, 
              width: "70%",
            }}
          />
        </div>

        <button
          style={{ 
            ...addButtonStyle, 
            ...addRouteNodeButtonHoverStyle, 
            ...addRouteNodeButtonLoadingStyle,
            marginTop: "auto",
          }}
          onClick={callAddRouteNode}
          disabled={loadingAddRouteNodeButton}
          onMouseEnter={() => setAddRouteNodeHoveringButton(true)}
          onMouseLeave={() => setAddRouteNodeHoveringButton(false)}
        >
          {loadingAddRouteNodeButton ? "Requesting…" : "Add"}
        </button>
      </div>
    
      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "2 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Delete Node</label>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingRight: "5px",
            alignSelf: "center",
            }}>Node ID:</label>
          <input
            id="delete_route_node_id"
            type="number"
            value={deleteRouteNodeIDInputValue}
            onChange={e => setDeleteRouteNodeIDInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputDeleteRouteNodeID(true)}
            onMouseLeave={() => setHoveringInputDeleteRouteNodeID(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputDeleteRouteNodeIDHoverStyle, 
              width: "60%",
            }}
          />
        </div>

        <button
          style={{ 
            ...deleteButtonStyle, 
            ...deleteRouteNodeButtonHoverStyle,
            ...deleteRouteNodeButtonLoadingStyle,
            marginTop: "auto",
          }}
          onClick={callDeleteRouteNode}
          disabled={loadingDeleteRouteNodeButton}
          onMouseEnter={() => setDeleteRouteNodeHoveringButton(true)}
          onMouseLeave={() => setDeleteRouteNodeHoveringButton(false)}
        >
          {loadingDeleteRouteNodeButton ? "Requesting…" : "Delete"}
        </button>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "3 / span 1",
        }}>
          <label style={{...labelTextStyle, fontWeight: "bold",}}>Edit Node</label>

          <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
            <label style={{
              ...labelTextStyle, 
              paddingRight: "5px",
              alignSelf: "center",
              }}>Node ID:</label>
            <input
              id="edit_route_node_id"
              type="number"
              value={editRouteNodeIDInputValue}
              onChange={e => setEditRouteNodeIDInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputEditRouteNodeID(true)}
              onMouseLeave={() => setHoveringInputEditRouteNodeID(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputEditRouteNodeIDHoverStyle, 
                width: "60%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              alignSelf: "center",
              }}>x:</label>
            <input
              id="edit_route_node_x"
              type="number"
              value={editRouteNodeXInputValue}
              onChange={e => setEditRouteNodeXInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputEditRouteNodeX(true)}
              onMouseLeave={() => setHoveringInputEditRouteNodeX(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputEditRouteNodeXHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
            <label style={{
              ...labelTextStyle, 
              paddingLeft: "15px",
              paddingRight: "22px",
              alignSelf: "center",
              }}>y:</label>
            <input
              id="edit_route_node_y"
              type="number"
              value={editRouteNodeYInputValue}
              onChange={e => setEditRouteNodeYInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputEditRouteNodeY(true)}
              onMouseLeave={() => setHoveringInputEditRouteNodeY(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputEditRouteNodeYHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
            <label style={{
              ...labelTextStyle, 
              paddingRight: "5px",
              alignSelf: "center",
              }}>Name:</label>
            <input
              id="edit_route_node_name"
              type="text"
              value={editRouteNodeNameInputValue}
              onChange={e => setEditRouteNodeNameInputValue(e.target.value)}
              onMouseEnter={() => setHoveringInputEditRouteNodeName(true)}
              onMouseLeave={() => setHoveringInputEditRouteNodeName(false)}
              style={{ 
                ...inputDataStyle , 
                ...inputEditRouteNodeNameHoverStyle, 
                width: "70%",
              }}
            />
          </div>

          <button
            style={{ 
              ...editButtonStyle, 
              ...editButtonHoverStyle,
              ...editRouteNodeButtonLoadingStyle, 
              marginTop: "auto",
            }}
            onClick={callEditRouteNode}
            disabled={loadingEditRouteNodeButton}
            onMouseEnter={() => setEditRouteNodeHoveringButton(true)}
            onMouseLeave={() => setEditRouteNodeHoveringButton(false)}
          >
            {loadingEditRouteNodeButton ? "Requesting…" : "Edit"}
          </button>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "4 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Response</label>
        {(
          <pre style={{ ...responseStyle }}>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              }}><strong>success:</strong> {" "}
              {modify_route_node_response?.success.toString() ?? ""}
            </div>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              }}><strong>node_id:</strong> {" "}
              {modify_route_node_response?.node_id.toString() ?? ""}
            </div>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
              }}><strong>message:</strong> {" "}
              {modify_route_node_response?.message.toString() ?? ""}
            </div>

          </pre>
        )}
      </div>

      <hr style={dividerStyle}/>

      <div style={routeEdgeBlockStyle}>
        <div style={{...panelStyle, padding: 0,}}>
          <label style={{
            paddingLeft: "5px",
            color: "#3f3f3f",
            fontSize: 10,
            fontWeight: "bold",
            gridColumn: "1 / span 4",
            }}>EDGE MANAGEMENT</label>
        </div>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "1 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Add Edge</label>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            // paddingLeft: "15px",
            paddingRight: "5px",
            alignSelf: "center",
            }}>From ID:</label>
          <input
            id="add_route_edge_from_id"
            type="number"
            value={addRouteEdgeFromIDInputValue}
            onChange={e => setAddRouteEdgeFromIDInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteEdgeFromID(true)}
            onMouseLeave={() => setHoveringInputAddRouteEdgeFromID(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteEdgeFromIDHoverStyle, 
              width: "60%",
            }}
          />
        </div>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingLeft: "16px",
            paddingRight: "10px",
            alignSelf: "center",
            }}>To ID:</label>
          <input
            id="add_route_edge_to_id"
            type="number"
            value={addRouteEdgeToIDInputValue}
            onChange={e => setAddRouteEdgeToIDInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteEdgeToID(true)}
            onMouseLeave={() => setHoveringInputAddRouteEdgeToID(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteEdgeToIDHoverStyle, 
              width: "60%",
            }}
          />
        </div>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingLeft: "16px",
            paddingRight: "12px",
            alignSelf: "center",
            }}>Cost:</label>
          <input
            id="add_route_edge_edge_cost"
            type="number"
            value={addRouteEdgeEdgeCostInputValue}
            onChange={e => setAddRouteEdgeEdgeCostInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputAddRouteEdgeEdgeCost(true)}
            onMouseLeave={() => setHoveringInputAddRouteEdgeEdgeCost(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputAddRouteEdgeEdgeCostHoverStyle, 
              width: "60%",
            }}
          />
        </div>

        <button
          style={{ 
            ...addButtonStyle, 
            ...addRouteEdgeButtonHoverStyle, 
            ...addRouteEdgeButtonLoadingStyle,
            marginTop: "auto",
          }}
          onClick={callAddRouteEdge}
          disabled={loadingAddRouteEdgeButton}
          onMouseEnter={() => setAddRouteEdgeHoveringButton(true)}
          onMouseLeave={() => setAddRouteEdgeHoveringButton(false)}
        >
          {loadingAddRouteEdgeButton ? "Requesting…" : "Add"}
        </button>

      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "2 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Delete Edge</label>

        <div style={{whiteSpace: "nowrap", marginTop: "5px",}}>
          <label style={{
            ...labelTextStyle, 
            paddingRight: "5px",
            alignSelf: "center",
            }}>Edge ID:</label>
          <input
            id="delete_route_edge_edge_id"
            type="number"
            value={deleteRouteEdgeEdgeIDInputValue}
            onChange={e => setDeleteRouteEdgeEdgeIDInputValue(e.target.value)}
            onMouseEnter={() => setHoveringInputDeleteRouteEdgeEdgeID(true)}
            onMouseLeave={() => setHoveringInputDeleteRouteEdgeEdgeID(false)}
            style={{ 
              ...inputDataStyle , 
              ...inputDeleteRouteEdgeEdgeIDHoverStyle, 
              width: "60%",
            }}
          />
        </div>

        <button
          style={{ 
            ...deleteButtonStyle, 
            ...deleteRouteEdgeButtonHoverStyle, 
            ...deleteRouteEdgeButtonLoadingStyle,
            marginTop: "auto",
          }}
          onClick={callDeleteRouteEdge}
          disabled={loadingDeleteRouteEdgeButton}
          onMouseEnter={() => setDeleteRouteEdgeHoveringButton(true)}
          onMouseLeave={() => setDeleteRouteEdgeHoveringButton(false)}
        >
          {loadingDeleteRouteEdgeButton ? "Requesting…" : "Delete"}
        </button>

      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "3 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Response</label>
        {(
          <pre style={{ ...responseStyle }}>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              }}><strong>success:</strong> {" "}
              {modify_route_edge_response?.success.toString() ?? ""}
            </div>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              }}><strong>edge_id:</strong> {" "}
              {modify_route_edge_response?.edge_id.toString() ?? ""}
            </div>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
              }}><strong>message:</strong> {" "}
              {modify_route_edge_response?.message.toString() ?? ""}
            </div>

          </pre>
        )}
      </div>

      <hr style={dividerStyle}/>

      <div style={routeNodeBlockStyle}>
        <div style={{...panelStyle, padding: 0,}}>
          <label style={{
            paddingLeft: "5px",
            color: "#3f3f3f",
            fontSize: 10,
            fontWeight: "bold",
            gridColumn: "1 / span 4",
            }}>GRAPH MANAGEMENT</label>
        </div>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "1 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Load Route</label>
        <button
          style={{ 
            ...loadButtonStyle, 
            ...loadButtonHoverStyle, 
            ...loadRouteGraphButtonLoadingStyle,
            marginBottom: 14,
          }}
          onClick={callLoadRouteGraph}
          disabled={loadingLoadRouteGraphButton}
          onMouseEnter={() => setLoadRouteGraphHoveringButton(true)}
          onMouseLeave={() => setLoadRouteGraphHoveringButton(false)}
        >
          {loadingLoadRouteGraphButton ? "Requesting…" : "Load"}
        </button>

        <label style={{...labelTextStyle, fontWeight: "bold",}}>Delete Route</label>
        <button
          style={{ 
            ...deleteButtonStyle, 
            ...deleteRouteGraphButtonHoverStyle, 
            ...deleteRouteGraphButtonLoadingStyle,
          }}
          onClick={callDeleteRouteGraph}
          disabled={loadingDeleteRouteGraphButton}
          onMouseEnter={() => setDeleteRouteGraphHoveringButton(true)}
          onMouseLeave={() => setDeleteRouteGraphHoveringButton(false)}
        >
          {loadingDeleteRouteGraphButton ? "Requesting…" : "Delete"}
        </button>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "2 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Visualize Route</label>
        <button
          style={{ 
            ...fetchButtonStyle, 
            ...fetchButtonHoverStyle, 
            ...fetchRouteGraphButtonLoadingStyle,
            marginBottom: 14,
          }}
          onClick={callFetchRouteGraph}
          disabled={loadingFetchRouteGraphButton}
          onMouseEnter={() => setFetchRouteGraphHoveringButton(true)}
          onMouseLeave={() => setFetchRouteGraphHoveringButton(false)}
        >
          {loadingFetchRouteGraphButton ? "Requesting…" : "Visualize"}
        </button>
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "3 / span 1",
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Response</label>
        {(
          <pre style={{ ...responseStyle }}>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              }}><strong>success:</strong> {" "}
              {manage_route_graph_response?.success.toString() ?? ""}
            </div>
            <div style={{
              overflow: "hidden", 
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
              }}><strong>message:</strong> {" "}
              {manage_route_graph_response?.message.toString() ?? ""}
            </div>

          </pre>
        )}
      </div>

      <div style={{
        ...commonDataCellStyle, 
        gridColumn: "4 / span 1",
        minHeight: 0,
        }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>List Routes</label>
        <button
          style={{ 
            ...listButtonStyle, 
            ...listButtonHoverStyle,
            ...listRouteGraphsButtonLoadingStyle,
          }}
          onClick={callListRouteGraphs}
          disabled={loadingListRouteGraphsButton}
          onMouseEnter={() => setListRouteGraphsHoveringButton(true)}
          onMouseLeave={() => setListRouteGraphsHoveringButton(false)}
        >
          {loadingListRouteGraphsButton ? "Requesting…" : "List"}
        </button>

        {(
          <pre style={{ 
              ...responseStyle, 
              overflowY: "auto",
              maxHeight: "50%",
              }}>
            <div style={{
              textOverflow: "ellipsis",
              }}><strong>success:</strong> {" "}
              {list_route_graphs_response?.success.toString() ?? ""}
            </div>
            <div style={{
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
              }}><strong>message:</strong> {" "}
              {list_route_graphs_response?.message.toString() ?? ""}
            </div>
            <div style={{
              }}><strong>route_graphs:</strong>
              <ul>
                {list_route_graphs_response?.route_graphs_list.map((routeGraph, index) => (
                  <li key={index}>{routeGraph}</li>
                ))}
              </ul>
            </div>
          </pre>
        )}
      </div>

    </div>
  )
}

export function initRouteManagerPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<RouteManagerPanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
