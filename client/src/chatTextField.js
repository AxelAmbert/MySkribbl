import * as React from "react";
import TextField from "@material-ui/core/TextField";
import ActionButton from "./actionButton";
import paintBucket from "./photorealistic-icons/paint-bucket.png";

class ChatTextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: ""
        }
    }

    render() {
        return ([
            <TextField  value={this.state.text} ref={ref => this.textFieldRef = ref} id="standard-basic" label="Standard"  onChange={(textEvent) => {
                this.setState({
                    text: textEvent.target.value
                });
            }}/>,
            <ActionButton img={<img src={paintBucket} alt="Logo" width={30} height={30}/>} trigger={
                () => {
                    console.log("envoie de ", this.state.text);
                    this.props.sendMessageTrigger(this.state.text);
                    this.setState({
                        text: ""
                    });
                }
            }/>,
        ]);
    }

}

export default ChatTextField;