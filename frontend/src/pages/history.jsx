import { AuthContext } from '../contexts/AuthContext.jsx'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';



export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);

            } catch (err) {
                //implement snackbar to show error message
                console.log(err);
            }
        }
        fetchHistory();
    }, [])


    return (
        <div>

            <IconButton onClick={() => {
                routeTo("/home")
            }}>
                <HomeIcon />
            </IconButton>

            {meetings.map((e, i) => {

                return (
                    <Card key={e._id || i} variant="outlined">

                        <CardContent>

                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                code: {e.meetingCode}
                            </Typography>

                            <Typography
                                sx={{ mb: 1.5 }}
                                color="text.secondary"
                            >
                                Date: {new Date(e.date).toLocaleString()}
                            </Typography>

                        </CardContent>

                    </Card>
                )
            })}

        </div>
    )
}
