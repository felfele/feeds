import * as React from 'react'
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { ScrollView, StyleSheet, Linking, View } from 'react-native'
import { Colors } from '../../../styles'
import { TypedNavigation } from '../../../helpers/navigation'
import { RegularText, BoldText } from '../../misc/text'
import { TouchableView } from '../../misc/TouchableView'

const WebLink = (props: {url: string}) => (
    <TouchableView onPress={() => Linking.openURL(props.url)}>
        <RegularText style={styles.link}>{props.url}</RegularText>
    </TouchableView>
)

const MailLink = (props: {email: string}) => (
    <TouchableView onPress={() => Linking.openURL('mailto:' + props.email)}>
        <RegularText style={styles.link}>{props.email}</RegularText>
    </TouchableView>
)

export const PrivacyPolicy = (props: {navigation: TypedNavigation}) => (
    <FragmentSafeAreaView>
        <NavigationHeader
            title='Terms & Privacy'
            navigation={props.navigation}
        />
        <ScrollView style={{
            backgroundColor: Colors.WHITE,
            paddingHorizontal: 10,
        }}>
            <BoldText style={styles.heading}>General</BoldText>
            <RegularText style={styles.paragraph}>
                Feeds is made by Felfele Foundation, a non-profit organization that builds products for people
                to connect and inspire each other, without being exploited by technology.
            </RegularText>

            <RegularText style={styles.paragraph}>
                Feeds does not collect or transmit any data to any servers – everything stays on your device.
                Felfele does not sell, rent or monetize your personal data or content in any way, ever.
            </RegularText>

            <BoldText style={styles.heading}>Export & Import</BoldText>
            <RegularText style={styles.paragraph}>
                When you use the Export functionality the application stores unencrypted data of your
                links on our servers for a limited amount of time so that others can import it.
            </RegularText>

            <BoldText style={styles.heading}>Support</BoldText>
            <RegularText style={styles.paragraph}>
                If you contact support or submit a Bug Report, any personal data you may share with us
                is kept only for the purposes of researching the issue and contacting you about your case.
            </RegularText>

            <BoldText style={styles.heading}>Contact us</BoldText>
            <RegularText style={styles.paragraph}>
                If you have questions about our Terms or Privacy Policy please contact us at&nbsp
            </RegularText>
            <MailLink email='hello@felfele.org'/>
            <RegularText style={styles.paragraph}>
                Or visit our website at&nbsp
            </RegularText><WebLink url='https://felfele.org'/>

            <View style={{paddingBottom: 100}}></View>
        </ScrollView>
    </FragmentSafeAreaView>
)

const styles = StyleSheet.create({
    heading: {
        fontSize: 18,
        paddingTop: 25,
    },
    paragraph: {
        paddingTop: 15,
        fontSize: 16,
    },
    link: {
        paddingVertical: 5,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
})
