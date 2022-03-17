import { shallowMount } from "@vue/test-utils";
import VerifyProof from "@/components/VerifyProof.vue";

describe("VerifyProof.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(VerifyProof, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
