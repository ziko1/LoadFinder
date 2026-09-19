package com.loadfinder.app
import org.junit.Test
import org.junit.Assert.assertTrue
class V56DetailActionsTest {
    @Test fun contractual_actions_require_explicit_confirmation_in_adapter() {
        val source = java.io.File("src/main/java/com/loadfinder/app/data/exchange/BackendExchangeAdapter.kt").readText()
        assertTrue(source.contains("require(confirmed)"))
    }
    @Test fun detail_flow_has_two_confirmation_dialogs() {
        val source = java.io.File("src/main/java/com/loadfinder/app/ui/HomeScreen.kt").readText()
        assertTrue(source.contains("Confirm offer"))
        assertTrue(source.contains("Confirm acceptance"))
        assertTrue(source.contains("contractual action"))
    }
}
