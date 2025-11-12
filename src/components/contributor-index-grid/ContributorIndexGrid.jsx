import React from 'react';
import { useEffect, useState, useContext } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";

import axios from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import ContributorCard from '../cards/contributor-card/ContributorCard';
import AuthContext from '../../context/AuthProvider';
import LoginModal from '../modals/LoginModal';
import DeleteModal from '../modals/DeleteModal';

import "./ContributorGrid.scss";

export default function UserIndexGrid(props) {
  const [ contributors, setContributors ] = useState([]);
  const [ applications, setApplications ] = useState([]);
  const [ loginModalIsOpen, setLoginModalIsOpen ] = useState(false);
  const [ deleteModalIsOpen, setDeleteModalIsOpen ] = useState(false);
  const [ targetContributor, setTargetContributor ] = useState({});
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useContext(AuthContext);
  const username = auth?.username;

  const { filters, limit } = props;

  let filterParams = '?';
  let apiUrl = '/contributors';

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
        const contributorsResp = await axios.get(apiUrl);
        setContributors(contributorsResp.data);

        if (username) {
          const applicationsResp = await axiosPrivate
            .get(`/users/${username}/applications`)
          setApplications(
            applicationsResp.data.map(
              relation => {
                const contributor_id = relation.contributor_id._id;
                const state = relation.state;
                return {contributor_id, state}
              }
            )
          );
        }
      } catch (err) {}
       
    }
    getData()
    
  }, [username, apiUrl])

  const triggerDeleteModal = ({contributor}) => {
    setTargetContributor(contributor);
    setDeleteModalIsOpen(true);
  }

  const deleteSuccessful = (contributorID) => {
    setContributors(prev => prev.filter(c => c._id !== contributorID));
  }

  const contributorCards = contributors.map((c, idx) => {
    const application = applications.filter(a => a.contributor_id.toString() === c._id.toString());
    const noOfAcceptance = c.applicants.filter(a => a.state === 'accepted').length;
    
    const isFilled = noOfAcceptance >= c.available_slots;
    return (
      <Grid key={idx} xs={6} md={4} item>
        
        <ContributorCard 
          contributor={c}
          status={ application.length > 0 ? application[0].state : 'not applied' }
          triggerLogin={() => setLoginModalIsOpen(true)}
          triggerDeleteModal={triggerDeleteModal}
          isFilled={isFilled}
        />
      </Grid>
    )
  });

  return (
    <>
      <Typography
        variant='h6'
        component="h1"
        textAlign={'center'}
        className='title'
      >
        Available contributor roles that may interest you
      </Typography>
      <Grid
        container
        spacing={2}
        columns={{ xs: 1, md: 12 }}
        justifyContent="center"
        alignItems="stretch"
      >
        {contributorCards}
      </Grid>
      <LoginModal 
        isOpen={loginModalIsOpen} 
        onClose={() => setLoginModalIsOpen(false)}
      />
      <DeleteModal 
        isOpen={deleteModalIsOpen}
        target={{contributor: targetContributor}} 
        onClose={() => setDeleteModalIsOpen(false)}
        deleteSuccessful={deleteSuccessful}
      />
    </> 
  )
}
