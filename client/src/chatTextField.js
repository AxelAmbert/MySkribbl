import * as React from "react";
import TextField from "@material-ui/core/TextField";
import ActionButton from "./actionButton";
import paintBucket from "./photorealistic-icons/paint-bucket.png";

class ChatTextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeSinceLastMessage: 0,
            text: "",
        }
    }

    render() {
        return ([
            <form onSubmit={(e) => {
                e.preventDefault();
                const text = this.state.text.substr(0, 50);
                if (this.state.text.length === 0)
                    return;
                const timeout = performance.now();
                if (timeout - this.state.timeSinceLastMessage < 1000)
                    return;
                this.props.sendMessageTrigger(text);
                this.setState({
                    text: "",
                    timeSinceLastMessage: timeout,
                });
                return (false);
            }}>
                <TextField value={this.state.text} ref={ref => this.textFieldRef = ref} id="standard-basic"
                           label="Write the word" onChange={(textEvent) => {
                    this.setState({
                        text: textEvent.target.value
                    });
                }}/>
            </form>,
            <ActionButton img={<img src={paintBucket} alt="Logo" width={30} height={30}/>} trigger={
                () => {
                    const text = this.state.text.substr(0, 50);

                    if (this.state.text.length === 0)
                        return (false);
                    const timeout = performance.now();
                    if (timeout - this.state.timeSinceLastMessage < 1000)
                        return;
                    this.props.sendMessageTrigger(text);
                    this.setState({
                        text: "",
                        timeSinceLastMessage: timeout,
                    });
                    return (false);
                }
            }/>,
        ]);
    }

}

export default ChatTextField;