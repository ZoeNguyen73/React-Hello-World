import { useEffect, useState, useContext } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useParams } from "react-router-dom";

import AvatarComponent from "../../avatar/Avatar";
import Button from "../../buttons/Button";
import "../Card.scss";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import AuthContext from "../../../context/AuthProvider";

export default function UserCard(props) {
  const { name, username, tagline, skills, interests, profile_pic_url } =
    props.user;

  const [buttonTitle, setButtonTitle] = useState("Following");
  const [followStatus, setFollowStatus] = useState(props.followed);
  const { auth } = useContext(AuthContext);
  const { isContributorPage, availability, updateAcceptance } = props;
  const [ appStatus, setAppStatus ] = useState(props.applicationStatus);

  const params = useParams();

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setAppStatus(props.applicationStatus);
    setFollowStatus(props.followed);
  }, [props.followed, props.applicationStatus]);

  useEffect(() => {
  }, [followStatus, appStatus]);

  const skillsDisplay = skills
    ? skills.map((skill, idx) => {
      return (
        <Typography className="card-subtitle" key={idx} variant="caption">
          {idx > 0 ? "| " : ""}
          {skill}
        </Typography>
      );
    })
    : [];

  const interestsDisplay = interests
  ? interests.map((interest, idx) => {
    return (
      <Typography className="card-subtitle" key={idx} variant="caption">
        {idx > 0 ? "| " : ""}
        {interest}
      </Typography>
    );
  })
  : [];

  const handleMouseOver = function () {
    setButtonTitle("Unfollow");
  };

  const handleMouseLeave = function () {
    setButtonTitle("Following");
  };

  const handleFollowAction = async function () {
    try {
      if (!auth.username) {
        props.triggerLogin();
        return;
      }
      if (followStatus) {
        await axiosPrivate.delete(`/users/${username}/unfollow`);
        setFollowStatus(false);
      } else {
        await axiosPrivate.post(`/users/${username}/follow`);
        setFollowStatus(true);
      }
      return;
    } catch (err) {}
  };

  const handleAcceptance = async function () {
    try {
      await axiosPrivate.put(`/contributors/${params.id}/accept/${username}`);
      setAppStatus('accepted');
      updateAcceptance();
    } catch (err) {}
  }

  const handleRejection = async function () {
    try {
      await axiosPrivate.put(`/contributors/${params.id}/reject/${username}`);
      setAppStatus('rejected');
    } catch (err) {}
  }

  return (
    <Card raised={true}>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <AvatarComponent
          imgAlt={name}
          imgUrl={profile_pic_url}
          sx={{ width: 80, height: 80 }}
        />

        <CardContent>
          <Typography variant="h6" className="card-title">
            {name}
          </Typography>
          <Typography variant="body2" className="card-tagline">
            {tagline}
          </Typography>
          <Box className='card-categories' sx={{maxHeight: '1.5em'}}>
            { skillsDisplay.length > 0 && (
              <>
                <VerifiedIcon sx={{color: 'var(--color3)', fontSize: 'medium'}}/>
                {skillsDisplay}
              </>
            )}
          </Box>
          <Box className='card-categories' sx={{maxHeight: '1.5em'}}>
            { interestsDisplay.length > 0 && (
              <>
                <FavoriteIcon sx={{color: 'var(--color3)', fontSize: 'medium'}}/>
                {interestsDisplay}
              </>
            )}
          </Box>
        </CardContent>
      </Box>

      <CardActions>
        <Box>
          <Button
            category={"action"}
            title={"View"}
            variant={"outlined"}
            route={`/users/${username}`}
          />
          { (!isContributorPage && username !== auth.username) && (
            <Button
              category={'action'}
              title={followStatus ? `${buttonTitle}` : 'Follow'}
              variant={followStatus ? 'outlined' : 'contained'}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              onClick={handleFollowAction}
            />
          )}

          { (isContributorPage 
            && appStatus !== 'rejected' 
            && appStatus !== 'accepted' 
            && username !== auth.username
          ) && (
            <>
              <Button
                category={'action'}
                title={'Reject'}
                variant={'outlined'}
                onClick={handleRejection}
              />
              { availability > 0 && (
                <Button
                  category={'action'}
                  title={'Accept'}
                  variant={'contained'}
                  onClick={handleAcceptance}
                />
              )}
            </>
          )}

          { (isContributorPage 
          && (appStatus === 'rejected' || appStatus === 'accepted' )
          && username !== auth.username
          ) && (
            <Button
              category={'status'}
              title={appStatus === 'rejected' ? 'Rejected' : 'Accepted'}
              variant={'outlined'}
            />
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
