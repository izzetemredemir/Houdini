import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

/**
 * Ledger Clear Signing Test Script (No Hardware Required)
 *
 * This script validates ERC-7730 metadata by:
 * 1. Decoding test vector calldata
 * 2. Comparing decoded values with expectedDisplay
 * 3. Verifying enum mappings
 * 4. Simulating what Ledger screen would show
 */

interface TestVector {
  description: string;
  transaction: {
    to: string;
    data: string;
    value: string;
  };
  expectedDisplay: {
    intent: string;
    fields: Array<{
      label: string;
      value: string;
    }>;
  };
}

interface ERC7730Metadata {
  context: {
    contract: {
      abi: any[];
      deployments: Array<{ chainId: string; address: string }>;
    };
  };
  metadata: {
    owner: string;
    info?: {
      legalName: string;
      url: string;
    };
    enums?: {
      [key: string]: {
        [value: string]: string;
      };
    };
  };
  display: {
    formats: {
      [signature: string]: {
        intent: string;
        fields: Array<{
          path: string;
          label: string;
          format: string;
          params?: any;
        }>;
      };
    };
  };
}

async function main() {
  console.log("\n🧪 Ledger Clear Signing Test (No Hardware)\n");
  console.log("=" .repeat(60));

  // Load ERC-7730 metadata
  const registryPath = "/Users/felix/Documents/ethglobal/clear-signing-erc7730-registry/registry/Houdini";
  const metadataPath = path.join(registryPath, "calldata-HoudiniIdentityNFT.json");
  const metadata: ERC7730Metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  console.log("\n📋 Loaded Metadata:");
  console.log(`   Contract: ${metadata.metadata.info?.legalName || "N/A"}`);
  console.log(`   Owner: ${metadata.metadata.owner}`);
  console.log(`   Address: ${metadata.context.contract.deployments[0].address}`);
  console.log(`   Chain ID: ${metadata.context.contract.deployments[0].chainId}`);

  // Create interface for decoding
  const iface = new ethers.Interface(metadata.context.contract.abi);

  // Test vectors to validate
  const testFiles = [
    "tests/mintIdentity-personal.json",
    "tests/mintIdentity-project.json",
    "tests/updateIdentity.json",
  ];

  let allPassed = true;

  for (const testFile of testFiles) {
    console.log("\n" + "─".repeat(60));
    console.log(`\n🔬 Testing: ${testFile}`);

    const testVector: TestVector = JSON.parse(
      fs.readFileSync(path.join(registryPath, testFile), "utf8")
    );

    console.log(`   Description: ${testVector.description}`);

    // Decode transaction data
    const decoded = iface.parseTransaction({ data: testVector.transaction.data });

    if (!decoded) {
      console.log("   ❌ FAILED: Could not decode transaction data");
      allPassed = false;
      continue;
    }

    console.log(`\n   📡 Decoded Function: ${decoded.name}`);
    console.log(`   📊 Function Signature: ${decoded.signature}`);

    // Get display format for this function
    const displayFormat = metadata.display.formats[decoded.signature];

    if (!displayFormat) {
      console.log(`   ❌ FAILED: No display format found for ${decoded.signature}`);
      allPassed = false;
      continue;
    }

    console.log(`\n   🎯 Expected Ledger Display:`);
    console.log(`   ┌${"─".repeat(48)}┐`);
    console.log(`   │ Intent: ${displayFormat.intent.padEnd(39)}│`);
    console.log(`   ├${"─".repeat(48)}┤`);

    // Validate each field
    let testPassed = true;

    for (let i = 0; i < displayFormat.fields.length; i++) {
      const field = displayFormat.fields[i];
      const expectedField = testVector.expectedDisplay.fields[i];

      // Get actual decoded value
      let actualValue: any = decoded.args[field.path];

      // Apply formatting
      let displayValue: string;
      if (field.format === "enum" && field.params?.$ref) {
        // Extract enum name from $ref (e.g., "$.metadata.enums.ProfileType" -> "ProfileType")
        const refPath = field.params.$ref.split(".");
        const enumName = refPath[refPath.length - 1];
        const enumMapping = metadata.metadata.enums?.[enumName];
        if (enumMapping && enumMapping[actualValue.toString()]) {
          displayValue = enumMapping[actualValue.toString()];
        } else {
          displayValue = actualValue.toString();
        }
      } else {
        displayValue = actualValue.toString();
      }

      // Compare with expected
      const matches = displayValue === expectedField.value;
      const status = matches ? "✅" : "❌";

      console.log(`   │ ${field.label}:`);
      console.log(`   │   ${displayValue.substring(0, 42).padEnd(42)}│`);

      if (!matches) {
        console.log(`   │   ${status} MISMATCH! Expected: ${expectedField.value}`);
        testPassed = false;
      } else {
        console.log(`   │   ${status} Match`);
      }
    }

    console.log(`   └${"─".repeat(48)}┘`);

    // Overall test result
    if (testPassed) {
      console.log(`\n   ✅ TEST PASSED: ${testFile}`);
    } else {
      console.log(`\n   ❌ TEST FAILED: ${testFile}`);
      allPassed = false;
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n✓ Metadata correctly decodes transaction calldata");
    console.log("✓ Display formatters match expected values");
    console.log("✓ Enum mappings work correctly");
    console.log("\n📱 This is what Ledger hardware will display!");
    console.log("\n✅ Ready for Ledger registry submission");
  } else {
    console.log("\n❌ SOME TESTS FAILED");
    console.log("\n⚠️  Fix issues before submitting to Ledger registry");
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error running tests:", error);
    process.exit(1);
  });
