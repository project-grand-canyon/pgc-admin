import React, { Component } from "react";
import styled from "@emotion/styled";

import { ReactComponent as CapitolIcon } from "../../assets/images/capitol-building.svg";
import styles from "./Closing.module.css";
import SimpleLayout from "../Layout/SimpleLayout";
import { Divider, Typography } from "antd";

const Para = styled(Typography.Paragraph)`
  font-size: 1.2em;
`;

class Closing extends Component {
  render() {
    return (
      <SimpleLayout>
        <div className={styles.Hero}>
          <CapitolIcon className={styles.capitol} />
          <div className={styles.main}>
            <Typography.Title
              level={1}
              style={{ marginTop: "10px", marginBottom: "10px" }}
            >
              Announcement: The Monthly Calling Campaign is making way for
              "CCL's Climate Actions"
            </Typography.Title>
          </div>
        </div>
        <Divider style={{ margin: "0" }} />
        <div className={styles.messageContainer}>
        <div className={styles.message}>
        <Typography.Text style={{fontStyle: "italic"}}>Dec. 15, 2022</Typography.Text>
        <Para>
          Dear MCC Caller,
        </Para>
        <Para>
          Beginning in January of 2023, Citizens' Climate Lobby (CCL) will be transitioning from the Monthly Calling Campaign (MCC) to a new program that we are tentatively calling "CCL’s Climate Actions."
        </Para>
        <Para>
        CCL's Climate Actions builds upon the success and lessons learned in the MCC. Actions will be more quickly and strategically timed to bill movement in Congress. They will include not only phone calls but also alternatives such as texts, emails, letters, and social media postings.
        </Para>
        <Para>
         If you are already a CCL member, you will automatically be enrolled in CCL's Climate Actions. Similar to MCC, you can expect an SMS or email about once a month to take action.
        </Para>
        <Para>
        If you're not a member of CCL and you'd like to become one, sign up at <a rel="noopener noreferrer" target="_blank" href="https://citizensclimatelobby.org/join-citizens-climate-lobby">citizensclimatelobby.org</a>.
        </Para>
        <Para>
        Over 5500 MCC callers have made 63,000 calls to Congress over the past 3 years. On behalf of everyone at CCL, thank you to all callers for all of your advocacy! Your calls to Congress have helped to get climate policy enacted!
        </Para>
        <Para>
        For more information see our <a rel="noopener noreferrer" target="_blank" href="https://community.citizensclimate.org/resources/item/19/390">Frequently Asked Questions</a>.
        </Para>
        
        <Para>
          Thank you,<br/>
          The MCC Team
        </Para>
        </div></div>
      </SimpleLayout>
    );
  }
}

export default Closing;
