import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

type EmailTemplateProps = {
  name?: string;
  redirectUrl?: string;
  linkText?: string;
  description?: string;
  subject?: string;
};

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  name = "",
  redirectUrl = "/login",
  linkText = "Verify Account",
  description = "",
  subject = "",
}) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/static/github.png`}
            width="32"
            height="32"
            alt="Github"
          />

          <Text style={title}>{linkText}</Text>

          <Section style={section}>
            <Text style={text}>
              Hey <strong>{name}</strong>!
            </Text>

            <Text style={text}>{description}</Text>

            <Link style={button} href={`${baseUrl}/${redirectUrl}`}>
              {linkText}
            </Link>
          </Section>

          <Section>
            <Row style={footerLogos}>
              <Column style={{ width: "66%" }}>
                <Img
                  src={`${baseUrl}/static/slack-logo.png`}
                  width="120"
                  height="36"
                  alt="Slack"
                />
              </Column>

              <Column>
                <Row>
                  <Column>
                    <Link href="/">
                      <Img
                        src={`${baseUrl}/static/slack-twitter.png`}
                        width="32"
                        height="32"
                        alt="Twitter"
                        style={socialMediaIcon}
                      />
                    </Link>
                  </Column>

                  <Column>
                    <Link href="/">
                      <Img
                        src={`${baseUrl}/static/slack-facebook.png`}
                        width="32"
                        height="32"
                        alt="Facebook"
                        style={socialMediaIcon}
                      />
                    </Link>
                  </Column>

                  <Column>
                    <Link href="/">
                      <Img
                        src={`${baseUrl}/static/slack-linkedin.png`}
                        width="32"
                        height="32"
                        alt="Linkedin"
                        style={socialMediaIcon}
                      />
                    </Link>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>

          <Text style={links}>
            <Link style={link}>Your security audit log</Link> ・{" "}
            <Link style={link}>Contact support</Link>
          </Text>

          <Text style={footer}>
            Auth System By JB, Inc. ・88 Colin P Kelly Jr Street ・San
            Francisco, CA 94107
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailTemplate;

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily:
    'system-ui,"Segoe UI",Helvetica,Arial,sans-serif',
};

const container: React.CSSProperties = {
  width: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const socialMediaIcon: React.CSSProperties = {
  display: "inline",
  marginLeft: "32px",
};

const footerLogos: React.CSSProperties = {
  marginBottom: "32px",
  paddingLeft: "8px",
  paddingRight: "8px",
  width: "100%",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  lineHeight: 1.25,
};

const section: React.CSSProperties = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center",
};

const text: React.CSSProperties = {
  margin: "0 0 10px 0",
  textAlign: "left",
};

const button: React.CSSProperties = {
  fontSize: "14px",
  backgroundColor: "#28a745",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "0.75em 1.5em",
  display: "inline-block",
};

const links: React.CSSProperties = {
  textAlign: "center",
};

const link: React.CSSProperties = {
  color: "#0366d6",
  fontSize: "12px",
};

const footer: React.CSSProperties = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center",
  marginTop: "60px",
};
