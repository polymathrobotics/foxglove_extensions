import { PanelExtensionContext } from "@foxglove/extension";
import { useState } from "react";
import { createRoot } from "react-dom/client";

// Service definitions --------
type StartBagRecordingRequest = {
  bag_suffix: string;
  include_topics: string[];
  exclude_topics: string[];
  topic_profile: string;
  record_duration: number;
}

// Response type
type StartBagRecordingResponse = {
  success: boolean;
  error: string;
  bag_name: string;
};

type StopBagRecordingRequest = {
  // No fields required for stopping
}

type StopBagRecordingResponse = {
  success: boolean;
  error: string;
  bag_name: string;
};

type GetBagRecordingStatusRequest = {
  // No fields required for getting status
}

type GetBagRecordingStatusResponse = {
  success: boolean;
  error: string;
  is_recording: boolean;
  bag_name: string;
  time_elapsed: number;
  recorded_topics: string;
};

function BagRecorderPanel({ context }: { context: PanelExtensionContext }) {
  // Common
  const [start_stop_bag_recording_response, setStartStopBagRecordingResponse] = useState<StartBagRecordingResponse | null>(null);
  const [get_bag_recording_status_response, setGetBagRecordingStatusResponse] = useState<GetBagRecordingStatusResponse | null>(null);
  const [error, setError] = useState<string>();

  // Bag suffix
  const bag_suffix_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "bag_suffix" in context.initialState
      ? String((context.initialState as any).bag_suffix)
      : "";
  const [bagSuffixInputValue, setBagSuffixInputValue] = useState<string>(bag_suffix_restored);
  const [hoveringInputBagSuffix, setHoveringInputBagSuffix] = useState(false);

  // Record duration
  const record_duration_restored =
    typeof context.initialState === "object" &&
    context.initialState !== null &&
    "record_duration" in context.initialState
      ? String((context.initialState as any).record_duration)
      : "0";
  const [recordDurationInputValue, setRecordDurationInputValue] = useState<string>(record_duration_restored);
  const [hoveringInputRecordDuration, setHoveringInputRecordDuration] = useState(false);

  // Topic mode selection
  const [selectedMode, setSelectedMode] = useState<number>(0);
  const [includeTopics, setIncludeTopics] = useState<string>("");
  const [excludeTopics, setExcludeTopics] = useState<string>("");
  const [topicProfile, setTopicProfile] = useState<string>("");
  const [hoveringIncludeTopics, setHoveringIncludeTopics] = useState(false);
  const [hoveringExcludeTopics, setHoveringExcludeTopics] = useState(false);
  const [hoveringTopicProfile, setHoveringTopicProfile] = useState(false);

  // Buttons
  const [loadingButtons, setLoadingButtons] = useState(false);
  const [loadingStartButton, setLoadingStartButton] = useState(false);
  const [loadingStopButton, setLoadingStopButton] = useState(false);
  const [loadingGetStatusButton, setLoadingGetStatusButton] = useState(false);
  const [hoveringStartButton, setHoveringStartButton] = useState(false);
  const [hoveringStopButton, setHoveringStopButton] = useState(false);
  const [hoveringGetStatusButton, setHoveringGetStatusButton] = useState(false);

  // Service calls
  const callStartBagRecording = async () => {
    // Indicate loading
    setLoadingButtons(true);
    setLoadingStartButton(true);
    setStartStopBagRecordingResponse(null);

    // Parse & guard for input
    const parsed_bag_suffix_val = bagSuffixInputValue.trim();
    const parsed_record_duration_val = parseInt(recordDurationInputValue, 10);

    if (parsed_record_duration_val < 0 || isNaN(parsed_record_duration_val)) {
      setError("Record duration must be a non-negative integer.");
      setLoadingButtons(false);
      setLoadingStartButton(false);
      setLoadingStopButton(false);
      return;
    }

    let parsed_include_topics_val: string[] = [];
    let parsed_exclude_topics_val: string[] = [];
    let parsed_topic_profile_val = "";
    if(selectedMode === 1) {
      parsed_include_topics_val = includeTopics.split(",").map(topic => topic.trim()).filter(topic => topic !== "");
    }
    if(selectedMode === 2) {
      parsed_exclude_topics_val = excludeTopics.split(",").map(topic => topic.trim()).filter(topic => topic !== "");
    }
    if(selectedMode === 3) {
      parsed_topic_profile_val = topicProfile.trim();
    }

    // Fill in request message
    const request: StartBagRecordingRequest = {
      bag_suffix: parsed_bag_suffix_val,
      include_topics: parsed_include_topics_val,
      exclude_topics: parsed_exclude_topics_val,
      topic_profile: parsed_topic_profile_val,
      record_duration: parsed_record_duration_val,
    };

    try {
      const raw = await context.callService?.("/bag_recorder/start_bag_recording", request);
      const res = raw as StartBagRecordingResponse;
      if(res){
        setStartStopBagRecordingResponse(res);
        setError(undefined);
      }
      setError(undefined);
      context.saveState({ bag_suffix: parsed_bag_suffix_val });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingButtons(false);
      setLoadingStartButton(false);
      setLoadingStopButton(false);
    }
  };

  const callStopBagRecording = async () => {
    // Indicate loading
    setLoadingButtons(true);
    setLoadingStopButton(true);
    setStartStopBagRecordingResponse(null);

    // Fill in request message
    const request: StopBagRecordingRequest = {};

    try {
      const raw = await context.callService?.("/bag_recorder/stop_bag_recording", request);
      const res = raw as StopBagRecordingResponse;
      if(res){
        setStartStopBagRecordingResponse(res);
        setError(undefined);
      }
      setError(undefined);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingButtons(false);
      setLoadingStartButton(false);
      setLoadingStopButton(false);
    }
  };

  const callGetBagRecordingStatus = async () => {
    // Indicate loading
    setLoadingButtons(true);
    setLoadingGetStatusButton(true);

    // Fill in request message
    const request: GetBagRecordingStatusRequest = {};

    try {
      const raw = await context.callService?.("/bag_recorder/get_bag_recording_status", request);
      const res = raw as GetBagRecordingStatusResponse;
      if(res){
        setGetBagRecordingStatusResponse(res);
        setError(undefined);
      }
      setError(undefined);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingButtons(false);
      setLoadingGetStatusButton(false);
    }
  };


  // Styles
  const panelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 24,
    borderRadius: 8,
  };
  const labelTextStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    paddingLeft: "5px",
    paddingBottom: "5px",
    marginTop: "5px",
  };
  const commonCellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderRadius: 4,
    resize: "vertical",
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
  const inputBagSuffixHoverStyle: React.CSSProperties = hoveringInputBagSuffix ? {
    borderColor: "#fff",
  } : {};
  const inputRecordDurationHoverStyle: React.CSSProperties = hoveringInputRecordDuration ? {
    borderColor: "#fff",
  } : {};
  const inputIncludeTopicsHoverStyle: React.CSSProperties = hoveringIncludeTopics ? {
    borderColor: "#fff",
  } : {};
  const inputExcludeTopicsHoverStyle: React.CSSProperties = hoveringExcludeTopics ? {
    borderColor: "#fff",
  } : {};
  const inputTopicProfileHoverStyle: React.CSSProperties = hoveringTopicProfile ? {
    borderColor: "#fff",
  } : {};


  const startButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "15px 5px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#00b409",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    width: "70%",
  };
  const startButtonHoverStyle: React.CSSProperties = hoveringStartButton
    ? { backgroundColor: "#018c08" } : {};
  const startButtonLoadingStyle: React.CSSProperties = loadingStartButton || loadingButtons
    ? { backgroundColor: "gray" } : {};

  const stopButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "15px 5px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#dd0000",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    width: "70%",
  };
  const stopButtonHoverStyle: React.CSSProperties = hoveringStopButton
    ? { backgroundColor: "#ba0000" } : {};
  const stopButtonLoadingStyle: React.CSSProperties = loadingStopButton || loadingButtons
    ? { backgroundColor: "gray" } : {};

  const getStatusButtonStyle: React.CSSProperties = {
    alignSelf: "center",
    flexShrink: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
    whiteSpace: "nowrap",
    padding: "15px 5px",
    border: "none",
    borderRadius: 2,
    backgroundColor: "#0079ca",
    fontSize: "0.73rem",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    width: "70%",
  };
  const getStatusButtonHoverStyle: React.CSSProperties = hoveringGetStatusButton
    ? { backgroundColor: "#006bb3" } : {};
  const getStatusButtonLoadingStyle: React.CSSProperties = loadingGetStatusButton || loadingButtons
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
    placeSelf: "center",
    minWidth: "90%",
  }

  const dividerStyle: React.CSSProperties = {
    display: "flex",
    width: "50%",
    border: "none",
    borderTop: "1px solid #2e2e2e",
    margin: "5px 0",
    placeSelf: "center",
  }

  return (
    <div style={panelStyle}>

      <div style={{
        whiteSpace: "nowrap",
        marginTop: "2px",
        placeSelf: "center",
        width: "100%",
      }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Bag Suffix</label>
        <input
          id="bag_suffix"
          type="text"
          value={bagSuffixInputValue}
          onChange={e => setBagSuffixInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputBagSuffix(true)}
          onMouseLeave={() => setHoveringInputBagSuffix(false)}
          style={{
            ...inputDataStyle ,
            ...inputBagSuffixHoverStyle,
            width: "70%",
            alignSelf: "center",
            marginLeft: "45px",
          }}
        />
      </div>

      <div style={{
        whiteSpace: "nowrap",
        marginTop: "2px",
        placeSelf: "center",
        width: "100%",
      }}>
        <label style={{...labelTextStyle, fontWeight: "bold",}}>Record Duration</label>
        <input
          id="record_duration"
          type="number"
          value={recordDurationInputValue}
          onChange={e => setRecordDurationInputValue(e.target.value)}
          onMouseEnter={() => setHoveringInputRecordDuration(true)}
          onMouseLeave={() => setHoveringInputRecordDuration(false)}
          style={{
            ...inputDataStyle ,
            ...inputRecordDurationHoverStyle,
            width: "70%",
            alignSelf: "center",
            marginLeft: "10px",
          }}
        />
      </div>

      <div style={{
        whiteSpace: "nowrap",
        marginTop: "2px",
        placeSelf: "center",
        width: "100%"
      }}>
        <label style={{
          ...labelTextStyle,
          fontWeight: "bold"
        }}>Topic Selection</label>
        <select
          value={selectedMode}
          onChange={e => setSelectedMode(Number(e.target.value))}
          style={{
            marginLeft: "15px",
            fontSize: 12,
            padding: "4px",
            borderRadius: 4,
            lineHeight: 1.4,
            background: "var(--foxglove-panel-surface)",
            color: "var(--foxglove-text-primary)",
            border: "1px solid #ccc",
          }}
        >
          <option value={0}>All topics</option>
          <option value={1}>Include topics</option>
          <option value={2}>Exclude topics</option>
          <option value={3}>Topic profile</option>
        </select>
      </div>

      {/* Show input boxes depending on mode */}
      {selectedMode === 1 && (
        <div style={{ margin: "8px 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <label style={{...labelTextStyle, fontWeight: "bold"}}>Include Topics</label>
          <input
            type="text"
            value={includeTopics}
            onChange={e => setIncludeTopics(e.target.value)}
            onMouseEnter={() => setHoveringIncludeTopics(true)}
            onMouseLeave={() => setHoveringIncludeTopics(false)}
            style={{
              ...inputDataStyle,
              ...inputIncludeTopicsHoverStyle,
              width: "100%",
              alignSelf: "center"
            }}
            placeholder="topic1,topic2,topic3"
          />
        </div>
      )}
      {selectedMode === 2 && (
        <div style={{ margin: "8px 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <label style={{...labelTextStyle, fontWeight: "bold"}}>Exclude Topics</label>
          <input
            type="text"
            value={excludeTopics}
            onChange={e => setExcludeTopics(e.target.value)}
            onMouseEnter={() => setHoveringExcludeTopics(true)}
            onMouseLeave={() => setHoveringExcludeTopics(false)}
            style={{
              ...inputDataStyle,
              ...inputExcludeTopicsHoverStyle,
              width: "100%",
              alignSelf: "center"
            }}
            placeholder="topicA,topicB"
          />
        </div>
      )}
      {selectedMode === 3 && (
        <div style={{ margin: "8px 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <label style={{...labelTextStyle, fontWeight: "bold"}}>Topic Profile</label>
          <input
            type="text"
            value={topicProfile}
            onChange={e => setTopicProfile(e.target.value)}
            onMouseEnter={() => setHoveringTopicProfile(true)}
            onMouseLeave={() => setHoveringTopicProfile(false)}
            style={{
              ...inputDataStyle,
              ...inputTopicProfileHoverStyle,
              width: "70%",
              alignSelf: "center"
            }}
          />
        </div>
      )}

      <button
        style={{
          ...startButtonStyle,
          ...startButtonHoverStyle,
          ...startButtonLoadingStyle,
        }}
        onClick={() => callStartBagRecording()}
        disabled={loadingStartButton || loadingButtons}
        onMouseEnter={() => setHoveringStartButton(true)}
        onMouseLeave={() => setHoveringStartButton(false)}
      >
        {loadingButtons ? (loadingStartButton ? "Requesting…" : "Start Recording") : "Start Recording"}
      </button>

      <button
        style={{
          ...stopButtonStyle,
          ...stopButtonHoverStyle,
          ...stopButtonLoadingStyle,
        }}
        onClick={() => callStopBagRecording()}
        disabled={loadingStopButton || loadingButtons}
        onMouseEnter={() => setHoveringStopButton(true)}
        onMouseLeave={() => setHoveringStopButton(false)}
      >
        {loadingButtons ? (loadingStopButton ? "Requesting…" : "Stop Recording") : "Stop Recording"}
      </button>

      {(
        <pre style={{ ...responseStyle }}>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            }}><strong>success:</strong> {" "}
            {start_stop_bag_recording_response?.success.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "wrap",
            }}><strong>bag_name:</strong> {" "}
            {start_stop_bag_recording_response?.bag_name.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "wrap",
            }}><strong>error:</strong> {" "}
            {start_stop_bag_recording_response?.error.toString() ?? ""}
          </div>

        </pre>
      )}

      {/* Divider */}

      <hr style={dividerStyle}/>

      {/* Get Bag Recording Status */}

      <button
        style={{
          ...getStatusButtonStyle,
          ...getStatusButtonHoverStyle,
          ...getStatusButtonLoadingStyle,
        }}
        onClick={() => callGetBagRecordingStatus()}
        disabled={loadingGetStatusButton || loadingButtons}
        onMouseEnter={() => setHoveringGetStatusButton(true)}
        onMouseLeave={() => setHoveringGetStatusButton(false)}
      >
        {loadingButtons ? (loadingGetStatusButton ? "Requesting…" : "Get Status") : "Get Status"}
      </button>

      {/* Recording Status Indicator */}
      {get_bag_recording_status_response && get_bag_recording_status_response?.success && (
        <div style={{
          display: "flex",
          alignItems: "start",
          background: "#23232b",
          borderRadius: 6,
          padding: "8px 16px",
          margin: "8px 0",
          width: "fit-content",
          minWidth: 120,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          gap: 10,
        }}>
          <span style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: get_bag_recording_status_response.is_recording ? "#ff2d2d" : "#888",
            marginRight: 3,
            marginTop: 2,
            boxShadow: get_bag_recording_status_response.is_recording ? "0 0 6px 2px #ff2d2d99" : undefined,
          }} />
          <span style={{
            color: get_bag_recording_status_response.is_recording ? "#ff2d2d" : "#aaa",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 0.5,
          }}>
            {get_bag_recording_status_response.is_recording ? "Recording" : "Not Recording"}
          </span>
        </div>
      )}

      {(
        <pre style={{ ...responseStyle }}>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            }}><strong>success:</strong> {" "}
            {get_bag_recording_status_response?.success.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "wrap",
            }}><strong>error:</strong> {" "}
            {get_bag_recording_status_response?.error.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            }}><strong>is_recording:</strong> {" "}
            {get_bag_recording_status_response?.is_recording.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            }}><strong>bag_name:</strong> {" "}
            {get_bag_recording_status_response?.bag_name.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            }}><strong>time_elapsed(s):</strong> {" "}
            {get_bag_recording_status_response?.time_elapsed.toString() ?? ""}
          </div>
          <div style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "wrap",
            }}><strong>recorded_topics:</strong> {" "}
            {get_bag_recording_status_response?.recorded_topics.split(" ").map((topic, idx) => (
              <li key={idx} style={{ marginLeft: "10px" }}>{topic}</li>
            ))}
          </div>
        </pre>
      )}

      {/* Error */}

      {error && (
        <div style={{
          ...commonCellStyle,
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
              gridColumn: "1 / span 1",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
              }}>{error}</div>
          </pre>
        </div>
      )}

    </div>
  );
}

export function initBagRecorderPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<BagRecorderPanel context={context} />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
