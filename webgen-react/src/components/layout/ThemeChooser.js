import React from "react";


export const ThemeChooser = (props) => {
    

    return (
        <div className="grid">
        {
            props.options.map((item,index)=> {
                return (
                    <div key={index} className="col-12 md:col-6 lg:col-4"> 
                        <div className={item.id === props.value.id ? "theme-item selected-theme-item" : "theme-item"} onClick={()=> props.onChange(item)}>
                            <img style={{width:"100%"}} alt="Logo" src={`http://144.91.85.117:8080/static/themes/${item.key}/assets/preview.jpg`}
                            onError={(e) => e.target.src='assets/layout/images/empty.png'} />
                            <h5 style={{textAlign:"center"}}>{item.name}</h5>
                        </div>
                    </div>
                )
            })
        }
        </div>
        // <SelectButton value={value} options={props.options} onChange={(e) => changeOption(e)} itemTemplate={justifyTemplate}/>
    );
}