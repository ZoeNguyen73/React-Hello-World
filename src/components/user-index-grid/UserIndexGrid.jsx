import React from "react";
import { useEffect, useState, useContext } from "react";

import Grid from "@mui/material/Unstable_Grid2";
import { Typography } from "@mui/material";

import axios from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import UserCard from "../cards/user-card/UserCard";
import AuthContext from "../../context/AuthProvider";
import LoginModal from "../modals/LoginModal";

import "../contributor-index-grid/ContributorGrid.scss";

export default function UserIndexGrid(props) {
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [ modalIsOpen, setModalIsOpen ] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useContext(AuthContext);
  const username = auth?.username;
  const { filters, limit } = props;

  let filterParams = '?';
  let apiUrl = '/users';

  if (filters) {
    Object.keys(filters).forEach((key, idx) => {
      const values = filters[key];
      if (values.length > 0) {
        filterParams += `${key}=${values.join(',').replaceAll(' ', '-')}`;
        if (idx < Object.keys(filters).length - 1 ) {
          filterParams += '&';
        };
      };
    });
  }

  if (limit) {
    if (filters) {
      filterParams += `&limit=${limit}`
    } else {
      filterParams += `limit=${limit}`
    }
  }

  if (filterParams.length > 1) {
    apiUrl += filterParams;
  }

  useEffect(() => {
    async function getData() {
      try {
        const usersResponse = await axios.get(apiUrl);
        setUsers(usersResponse.data);
        // console.log("usersResponse.data: " + JSON.stringify(usersResponse.data));

        if (username) {
          const followingUsersResponse = await axiosPrivate.get(
            `/users/${username}/following`
          );
          setFollowingUsers(
            followingUsersResponse.data.map(
              (relation) => relation.followee.username
            )
          );

          const followersResponse = await axiosPrivate.get(
            `/users/${username}/followers`
          );
          setFollowers(
            followersResponse.data.map((relation) => relation.follower.username)
          );
        }
      } catch (error) {}
    }

    getData();
  }, [username, props, apiUrl])

  const userCards = users.map((user, idx) => {
    return (
      <Grid key={idx} xs={6} md={4} item>
        <UserCard
          user={user}
          followed={followingUsers.includes(user.username)}
          triggerLogin={() => setModalIsOpen(true)}
        />
      </Grid>
    );
  });

  return (
    <>
      <Typography
        variant='h6'
        component="h1"
        textAlign={'center'}
        className='title'
      >
        Connect with like-minded community members
      </Typography>
      <Grid
        container
        spacing={2}
        columns={{ xs: 1, md: 12 }}
        justifyContent="center"
        alignItems="stretch"
      >
        {userCards}
      </Grid>
      <LoginModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />
    </>
  );
}
