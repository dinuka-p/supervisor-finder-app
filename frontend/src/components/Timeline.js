import React, { useEffect, useState } from "react"
import { useAuth } from  "../context/AuthProvider"
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";


export default function Timeline() {

    const { auth } = useAuth();
    const [group, setGroup] = useState("supervisors");
    const [currentTask, setCurrentTask] = useState(3);
    

    const [date1, setDate1] = useState(new Date());
    const [date2, setDate2] = useState(new Date());
    const [date3, setDate3] = useState(new Date());
    const [date4, setDate4] = useState(new Date());

    useEffect(() => {
        fetch("/api/get-deadlines").then(
            res => res.json()
        ).then(
            data => {
                setDate1(new Date(data.date1));
                setDate2(new Date(data.date2));
                setDate3(new Date(data.date3));
                setDate4(new Date(data.date4));
            }
        )

        fetch("/api/get-dashboard-details").then(
            res => res.json()
        ).then(
            data => {
                setCurrentTask(data.currentTask-1); 
        })

    
        if (auth.role === "Supervisor") {
            setGroup("students");
        }

    }, [])

    const deadlines = [date1, date2, date3, date4];

    const steps = [
        "Complete your profile",
        `Find ${group}`,
        "Submit your preferences",
        "Wait for allocation!"
      ];

    return (
        <Box sx={{ width: "100%" }}>
            <Stepper activeStep={currentTask} alternativeLabel>
            {steps.map((label, index) => (
                <Step key={label}
                sx={{
                    "& .MuiStepLabel-root .Mui-completed": {
                        color: "#014254"
                    },
                    "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel": {
                        color: "#014254"
                    },
                    "& .MuiStepLabel-root .Mui-active": {
                        color: "#5f9ea0"
                    },
                    "& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel": {
                        color: "#5f9ea0"
                    }
                }}
                >
                <StepLabel>
                    <Typography variant="body1" sx={{ fontSize: index === currentTask ? 20 : 18 , fontWeight: index === currentTask ? "bold" : "normal"  }}>
                        {label}
                        <br />
                        by {deadlines[index].toLocaleDateString()}
                    </Typography>
                </StepLabel>
                </Step>
            ))}
            </Stepper>
        </Box>
    );
}