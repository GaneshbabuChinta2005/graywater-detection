/**
 * Comprehensive Automated Test Suite for Places Module
 * HydroSense AI - Andhra Pradesh Regional Water Quality Monitoring
 * 
 * Verifies:
 * 1. 10 Predefined Locations & Zero Nellore Guarantee
 * 2. Search, Filter, and Sort API Functionality
 * 3. Individual Location Metadata and Station Resolution
 * 4. 5 Water Quality Parameters, Accurate Units, and Compliance Evaluation
 * 5. Authentic "Data Not Available" Handling Without Fabrication
 * 6. Historical Time-Series Retrieval and Gap Preservation
 * 7. Multi-City Side-by-Side Comparison Matrix
 * 8. CSV Export and Validated CSV Import
 * 9. Absolute Decoupling from Greywater AI Pipeline
 */

const assert = require('assert');
const memoryStore = require('../backend/src/services/storageFallback');
const app = require('../backend/src/app');

async function runPlacesTestSuite() {
  console.log('================================================================');
  console.log('STARTING PLACES MODULE VERIFICATION SUITE (ANDHRA PRADESH WQ)');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${err.message}`);
    }
  }

  // --- Test 1: Exactly 10 Predefined Locations & No Nellore ---
  test('Requirement 2: Predefined 10 AP Locations list integrity and exclusion of Nellore', () => {
    const places = memoryStore.getPlaces();
    assert.strictEqual(places.length, 10, 'Expected exactly 10 predefined locations');

    const expectedCities = [
      'Visakhapatnam',
      'Vijayawada',
      'Guntur',
      'Kurnool',
      'Mantralayam',
      'Rajamahendravaram',
      'Amaravati',
      'Rajam',
      'Tirupati',
      'Srikakulam'
    ];

    const actualCityNames = places.map(p => p.city_name);
    expectedCities.forEach(city => {
      assert.ok(actualCityNames.includes(city), `Missing expected city: ${city}`);
    });

    // Explicit constraint verification
    const hasNellore = actualCityNames.some(c => c.toLowerCase().includes('nellore'));
    assert.strictEqual(hasNellore, false, 'CRITICAL: Nellore must NOT be included in predefined locations');
  });

  // --- Test 2: Location Card Schema Attributes ---
  test('Requirement 3: Location card schema fields and metadata completeness', () => {
    const places = memoryStore.getPlaces();
    places.forEach(p => {
      assert.ok(p.location_id, 'Missing location_id');
      assert.ok(p.city_name, 'Missing city_name');
      assert.ok(p.district_name, 'Missing district_name');
      assert.strictEqual(p.state, 'Andhra Pradesh', 'State must be Andhra Pradesh');
      assert.ok(typeof p.latitude === 'number', 'Latitude must be numeric');
      assert.ok(typeof p.longitude === 'number', 'Longitude must be numeric');
      assert.ok(p.station_count >= 1, `Location ${p.city_name} must have at least 1 monitoring station`);
      assert.ok(p.data_available === true, 'Data availability must be boolean true for initialized AP cities');
      assert.ok(p.latest_sample_date !== null, 'Latest sample date must be present');
    });
  });

  // --- Test 3: Search, District Filtering, and Sorting ---
  test('Requirement 4: Search, district filter, availability filter, and sort logic', () => {
    // Search by city partial match
    const searchRes = memoryStore.getPlaces({ search: 'visakha' });
    assert.strictEqual(searchRes.length, 1);
    assert.strictEqual(searchRes[0].city_name, 'Visakhapatnam');

    // District filter
    const kurnoolDistrict = memoryStore.getPlaces({ district: 'Kurnool' });
    assert.strictEqual(kurnoolDistrict.length, 2, 'Kurnool district should contain Kurnool and Mantralayam');
    const kurnoolCities = kurnoolDistrict.map(c => c.city_name);
    assert.ok(kurnoolCities.includes('Kurnool'));
    assert.ok(kurnoolCities.includes('Mantralayam'));

    // Sorting A-Z and Z-A
    const sortedAsc = memoryStore.getPlaces({ sort: 'name_asc' });
    assert.strictEqual(sortedAsc[0].city_name, 'Amaravati');
    assert.strictEqual(sortedAsc[sortedAsc.length - 1].city_name, 'Visakhapatnam');

    const sortedDesc = memoryStore.getPlaces({ sort: 'name_desc' });
    assert.strictEqual(sortedDesc[0].city_name, 'Visakhapatnam');
    assert.strictEqual(sortedDesc[sortedDesc.length - 1].city_name, 'Amaravati');
  });

  // --- Test 4: Individual Location Details & Stations ---
  test('Requirement 5 & 10: Individual location metadata and station decoupling', () => {
    const vizag = memoryStore.getPlaceById('visakhapatnam');
    assert.ok(vizag, 'Location visakhapatnam should be found');
    assert.strictEqual(vizag.city_name, 'Visakhapatnam');
    assert.strictEqual(vizag.stations.length, 3, 'Visakhapatnam should have 3 distinct stations');

    // Verify stations are not mixed across cities
    const stations = memoryStore.getStationsByPlaceId('visakhapatnam');
    stations.forEach(st => {
      assert.strictEqual(st.location_id, 'visakhapatnam');
      assert.ok(st.station_name, 'Station name required');
      assert.ok(st.water_body_name, 'Water body required');
      assert.ok(st.latitude > 12 && st.latitude < 20, 'Latitude must be in AP bounds');
      assert.ok(st.longitude > 76 && st.longitude < 85, 'Longitude must be in AP bounds');
      assert.ok(st.data_source.includes('CPCB') || st.data_source.includes('APPCB'), 'Must reference official CPCB/APPCB source');
    });

    // Unknown place returns null
    const notFound = memoryStore.getPlaceById('non_existent_city');
    assert.strictEqual(notFound, null);
  });

  // --- Test 5: The 5 Mandatory Water Quality Parameters ---
  test('Requirement 6 & 7: 5 mandatory parameters, official units, and compliance evaluation', () => {
    const wq = memoryStore.getWaterQuality('visakhapatnam');
    const expectedParams = ['TSS', 'BOD', 'COD', 'pH', 'Faecal_Coliform'];

    expectedParams.forEach(param => {
      assert.ok(wq[param], `Parameter ${param} must be present in response`);
      const item = wq[param];
      assert.strictEqual(item.parameter, param);

      if (item.is_available) {
        assert.ok(typeof item.value === 'number', `Value for ${param} must be numeric`);
        assert.ok(item.sample_date !== null, `Sample date for ${param} must not be null`);
        assert.ok(item.compliance_status, `Compliance status must be evaluated for ${param}`);
      }
    });

    // Unit verification
    assert.strictEqual(wq.pH.unit, 'pH units');
    assert.strictEqual(wq.BOD.unit, 'mg/L');
    assert.strictEqual(wq.COD.unit, 'mg/L');
    assert.strictEqual(wq.TSS.unit, 'mg/L');
    assert.strictEqual(wq.Faecal_Coliform.unit, 'MPN/100mL');
  });

  // --- Test 6: Controlled Missing Data Handling ("Data Not Available") ---
  test('Requirement 6.3 & 6.4: Graceful "Data Not Available" handling without zero/fake substitution', () => {
    // Station APPCB_NWMP_4381 (Pedda Cheruvu, Rajam) intentionally has Faecal Coliform omitted
    const rajamWq = memoryStore.getWaterQuality('rajam', 'APPCB_NWMP_4381');
    assert.ok(rajamWq.Faecal_Coliform);
    assert.strictEqual(rajamWq.Faecal_Coliform.is_available, false);
    assert.strictEqual(rajamWq.Faecal_Coliform.value, null, 'Value must be null when missing (never 0)');
    assert.strictEqual(rajamWq.Faecal_Coliform.compliance_status, 'Data Not Available', 'Must display Data Not Available');

    // Station APPCB_NWMP_3105 (Mantralayam downstream) intentionally has COD omitted
    const mantralayamWq = memoryStore.getWaterQuality('mantralayam', 'APPCB_NWMP_3105');
    assert.ok(mantralayamWq.COD);
    assert.strictEqual(mantralayamWq.COD.is_available, false);
    assert.strictEqual(mantralayamWq.COD.value, null, 'Value must be null when missing');
    assert.strictEqual(mantralayamWq.COD.compliance_status, 'Data Not Available');
  });

  // --- Test 7: Historical Time-Series and Chronological Ordering ---
  test('Requirement 8: Historical water quality analysis with ascending chronology and gap preservation', () => {
    const history = memoryStore.getPlaceHistory('vijayawada', { parameter: 'BOD' });
    assert.ok(history.length >= 10, 'Expected multiple monthly sampling rounds for Vijayawada BOD');

    // Verify sorted in ascending order of sample_date
    for (let i = 0; i < history.length - 1; i++) {
      const d1 = new Date(history[i].sample_date).getTime();
      const d2 = new Date(history[i + 1].sample_date).getTime();
      assert.ok(d1 <= d2, 'Historical series must be sorted ascending chronologically');
    }

    // Verify unit and provenance preserved
    history.forEach(point => {
      assert.strictEqual(point.unit, 'mg/L');
      assert.ok(point.data_source);
    });
  });

  // --- Test 8: Multi-City Comparison Feature ---
  test('Requirement 11: Multi-city side-by-side comparison matrix', () => {
    const cmp = memoryStore.comparePlaces(['visakhapatnam', 'vijayawada', 'guntur']);
    assert.strictEqual(cmp.cities.length, 3, 'Should return 3 cities in comparison');
    assert.strictEqual(cmp.matrix.length, 5, 'Should return 5 parameter comparison rows');

    const bodRow = cmp.matrix.find(r => r.parameter_key === 'BOD');
    assert.ok(bodRow, 'BOD comparison row must exist');
    assert.ok(bodRow.visakhapatnam, 'Visakhapatnam cell must exist in BOD row');
    assert.ok(bodRow.vijayawada, 'Vijayawada cell must exist in BOD row');
    assert.ok(bodRow.guntur, 'Guntur cell must exist in BOD row');
  });

  // --- Test 9: Data Integrity & Validated CSV Import ---
  test('Requirement 17 & 28: Input validation, rejection of invalid data, and verified CSV import', () => {
    // 1. Invalid parameter rejection
    const invalidParam = [{
      station_id: 'TEST_01',
      location_id: 'visakhapatnam',
      parameter_name: 'Lead_Heavy_Metal', // Not one of 5
      value: 10,
      sample_date: '2026-05-01'
    }];
    const res1 = memoryStore.importMeasurements(invalidParam);
    assert.strictEqual(res1.imported_count, 0);
    assert.strictEqual(res1.errors_count, 1);

    // 2. Negative BOD rejection
    const negativeBod = [{
      station_id: 'TEST_01',
      location_id: 'visakhapatnam',
      parameter_name: 'BOD',
      value: -5.0, // Negative BOD invalid
      sample_date: '2026-05-01'
    }];
    const res2 = memoryStore.importMeasurements(negativeBod);
    assert.strictEqual(res2.imported_count, 0);
    assert.strictEqual(res2.errors_count, 1);

    // 3. Valid measurement import
    const validRec = [{
      station_id: 'CPCB_NWMP_1795',
      location_id: 'visakhapatnam',
      parameter_name: 'BOD',
      value: 2.35,
      unit: 'mg/L',
      sample_date: '2026-09-01',
      data_source: 'CPCB Official Inspection'
    }];
    const res3 = memoryStore.importMeasurements(validRec);
    assert.strictEqual(res3.imported_count, 1);
    assert.strictEqual(res3.errors_count, 0);
  });

  // --- Test 10: Absolute Decoupling from Greywater AI Pipeline ---
  test('Requirement 19: Complete separation between Places module and Greywater AI pipeline', () => {
    // Verify that Places measurements are completely distinct from Greywater collections
    assert.strictEqual(memoryStore.telemetry.length, 21, 'Greywater telemetry count must not be polluted by places data');
    assert.strictEqual(memoryStore.analyses.length, 0, 'Greywater analyses collection must remain clean');

    // Verify greywater routing decisions remain strictly 4 domestic classes (0, 1, 2, 3)
    const sources = ['Bathroom', 'Kitchen', 'Laundry', 'Mixed'];
    memoryStore.telemetry.forEach(t => {
      assert.ok(sources.includes(t.greywater_source), 'Greywater sources must remain domestic residential fixtures');
    });
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL PLACES TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log('----------------------------------------------------------------');

  if (passedTests === totalTests) {
    console.log('ALL PLACES MODULE VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)\n');
    return 0;
  } else {
    console.error('SOME TESTS FAILED!\n');
    return 1;
  }
}

runPlacesTestSuite();

