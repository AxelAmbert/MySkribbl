import React from "react";

class Mdr extends React.Component
{
    render() {
        return (
            <div>
                <button className="favorite styled"
                        type="button"
                        onClick={

                            () => {
                                console.log("clicj");
                            }}>
                    Add to favorites
                </button>
            </div>
        );
    }
}

export default Mdr
